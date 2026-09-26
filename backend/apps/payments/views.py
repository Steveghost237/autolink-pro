import json
import uuid
from decimal import Decimal
from django.conf import settings
from django.db import transaction as db_transaction
from django.utils import timezone
from django.http import HttpResponseRedirect
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment, Payout, WalletTransaction
from .serializers import PaymentSerializer, PayoutSerializer, WalletTransactionSerializer, TopUpSerializer
from . import providers


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('ADMIN', 'CONTROLLER'):
            return Payment.objects.all()
        return Payment.objects.filter(payer=user)

    def perform_create(self, serializer):
        serializer.save(payer=self.request.user)


class PayoutViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('ADMIN', 'CONTROLLER'):
            return Payout.objects.all()
        return Payout.objects.filter(recipient=user)


class WalletViewSet(viewsets.ViewSet):
    """Solde AutoLink — rechargement et historique."""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        return Response({
            'balance': request.user.balance,
            'transactions': WalletTransactionSerializer(
                request.user.wallet_transactions.all()[:50], many=True
            ).data,
        })

    @action(detail=False, methods=['post'])
    def topup(self, request):
        serializer = TopUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data['amount']
        method = serializer.validated_data['method']
        ref = f'TOP-{uuid.uuid4().hex[:10].upper()}'

        # ── Paiement externe LIVE : Stripe Checkout / PayPal ────────────────
        # La recharge reste "pending" ; le solde n'est crédité qu'au retour
        # du client après paiement vérifié côté serveur (ou webhook Stripe).
        if method in ('stripe', 'paypal'):
            tx = WalletTransaction.objects.create(
                user=request.user, kind='topup', method=method, amount=amount,
                balance_after=request.user.balance or 0,
                reference=ref, status='pending',
                note=f'Rechargement {method} — en attente de paiement',
            )
            try:
                if method == 'stripe':
                    r = providers.stripe_create_checkout(
                        amount, ref, f'Recharge AutoLink {ref}',
                        success_url=self._abs(request, '/api/payments/stripe-return/'),
                        cancel_url=self._abs(request, '/api/payments/stripe-return/?canceled=1'),
                        email=request.user.email)
                    tx.provider_ref = r['id']
                    tx.save(update_fields=['provider_ref'])
                    url = r['url']
                else:
                    r = providers.paypal_create_order(
                        amount, ref, f'Recharge AutoLink {ref}',
                        return_url=self._abs(request, '/api/payments/paypal-return/'),
                        cancel_url=self._abs(request, '/api/payments/paypal-return/?canceled=1'))
                    tx.provider_ref = r['id']
                    tx.save(update_fields=['provider_ref'])
                    url = r['approval_url']
            except providers.ProviderError as e:
                tx.status = 'failed'
                tx.save(update_fields=['status'])
                return Response({'detail': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
            return Response({
                'payment_url': url,
                'transaction': WalletTransactionSerializer(tx).data,
            }, status=status.HTTP_202_ACCEPTED)

        # ── Mobile money (MTN/Orange/SenBid/PayBid) : crédit direct ─────────
        # En attente des APIs des opérateurs locaux.
        with db_transaction.atomic():
            user = request.user.__class__.objects.select_for_update().get(pk=request.user.pk)
            user.balance = (user.balance or Decimal('0')) + amount
            user.save(update_fields=['balance', 'updated_at'])
            tx = WalletTransaction.objects.create(
                user=user, kind='topup', method=method, amount=amount,
                balance_after=user.balance,
                reference=ref,
                note=f'Rechargement via {method}',
            )
        return Response({
            'balance': user.balance,
            'transaction': WalletTransactionSerializer(tx).data,
        }, status=status.HTTP_201_CREATED)

    @staticmethod
    def _abs(request, path):
        """URL absolue de l'API pour les redirections des providers."""
        return request.build_absolute_uri(path)


def _credit_wallet_tx(tx, note_suffix=''):
    """Crédite le solde d'une recharge externe — idempotent."""
    if tx.status != 'pending':
        return False
    with db_transaction.atomic():
        user = tx.user.__class__.objects.select_for_update().get(pk=tx.user_id)
        user.balance = (user.balance or Decimal('0')) + tx.amount
        user.save(update_fields=['balance', 'updated_at'])
        tx.status = 'completed'
        tx.balance_after = user.balance
        if note_suffix:
            tx.note = f'{tx.note} {note_suffix}'
        tx.save(update_fields=['status', 'balance_after', 'note'])
    return True


def _confirm_booking_payment(payment):
    """Confirme la réservation associée à un paiement externe vérifié :
    paiement → confirmed, chauffeur assigné, notifications."""
    from apps.bookings.views import _assign_internal_driver, _notify
    booking = payment.booking
    if payment.status != 'completed':
        payment.status = 'completed'
        payment.paid_at = timezone.now()
        payment.save(update_fields=['status', 'paid_at'])
    if booking.status == 'pending':
        booking.status = 'confirmed'
        booking.save(update_fields=['status', 'updated_at'])
        if booking.driver_type == 'internal':
            _assign_internal_driver(booking)
        vehicle = booking.vehicle
        _notify(vehicle.owner, 'Nouvelle réservation',
                f'Votre véhicule {vehicle} a été réservé par {booking.client.get_full_name()} '
                f'du {booking.start_date} au {booking.end_date} (paiement {payment.method} reçu).')
        booking.sync_vehicle_status()


class StripeReturnView(APIView):
    """Retour client après Stripe Checkout — vérifie serveur + crédit/confirm."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        front = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        is_booking = request.query_params.get('ctx') == 'booking'
        target = f'{front}/client/bookings?payment=' if is_booking else f'{front}/client/dashboard?topup='
        session_id = request.query_params.get('session_id', '')
        canceled = request.query_params.get('canceled')
        if canceled or not session_id:
            return HttpResponseRedirect(target + 'canceled')
        try:
            session = providers.stripe_get_session(session_id)
        except providers.ProviderError:
            return HttpResponseRedirect(target + 'error')

        if session.get('payment_status') != 'paid':
            return HttpResponseRedirect(target + 'pending')

        ref = (session.get('metadata') or {}).get('autolink_ref', '')
        tx = WalletTransaction.objects.filter(reference=ref, status='pending').first()
        if tx:
            _credit_wallet_tx(tx, '(Stripe vérifié)')
            return HttpResponseRedirect(f'{front}/client/dashboard?topup=success')
        payment = Payment.objects.filter(transaction_ref=session_id, status='pending').first()
        if payment:
            _confirm_booking_payment(payment)
            return HttpResponseRedirect(f'{front}/client/bookings?payment=success')
        return HttpResponseRedirect(f'{front}/client/dashboard?topup=success')


class PayPalReturnView(APIView):
    """Retour client après approbation PayPal — capture + crédit/confirm."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        front = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        is_booking = request.query_params.get('ctx') == 'booking'
        target = f'{front}/client/bookings?payment=' if is_booking else f'{front}/client/dashboard?topup='
        order_id = request.query_params.get('token', '')
        canceled = request.query_params.get('canceled')
        if canceled or not order_id:
            return HttpResponseRedirect(target + 'canceled')
        try:
            r = providers.paypal_capture_order(order_id)
        except providers.ProviderError:
            return HttpResponseRedirect(target + 'error')
        if r.get('status') != 'COMPLETED':
            return HttpResponseRedirect(target + 'pending')

        tx = WalletTransaction.objects.filter(provider_ref=order_id, status='pending').first()
        if tx:
            _credit_wallet_tx(tx, '(PayPal capturé)')
            return HttpResponseRedirect(f'{front}/client/dashboard?topup=success')
        payment = Payment.objects.filter(transaction_ref=order_id, status='pending').first()
        if payment:
            _confirm_booking_payment(payment)
            return HttpResponseRedirect(f'{front}/client/bookings?payment=success')
        return HttpResponseRedirect(f'{front}/client/dashboard?topup=success')


class StripeWebhookView(APIView):
    """Webhook Stripe — sécurise la confirmation même si le client ferme
    son navigateur avant le retour. Actif si STRIPE_WEBHOOK_SECRET est défini."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
        sig = request.headers.get('Stripe-Signature', '')
        try:
            if secret:
                event = providers.stripe_verify_webhook(request.body, sig, secret)
            else:
                event = json.loads(request.body.decode())
        except Exception:
            return Response({'detail': 'Signature invalide'}, status=status.HTTP_400_BAD_REQUEST)

        if event.get('type') == 'checkout.session.completed':
            session = event.get('data', {}).get('object', {})
            ref = (session.get('metadata') or {}).get('autolink_ref', '')
            tx = WalletTransaction.objects.filter(reference=ref, status='pending').first()
            if tx:
                _credit_wallet_tx(tx, '(webhook Stripe)')
            else:
                payment = Payment.objects.filter(
                    transaction_ref=session.get('id'), status='pending').first()
                if payment:
                    _confirm_booking_payment(payment)
        return Response({'received': True})
