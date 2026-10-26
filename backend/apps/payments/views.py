import json
import uuid
import hmac
from decimal import Decimal
from django.conf import settings
from django.db import transaction as db_transaction
from django.utils import timezone
from django.http import HttpResponseRedirect
from rest_framework import filters, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import Payment, Payout, WalletTransaction
from apps.bookings.models import Booking
from .serializers import PaymentSerializer, PayoutSerializer, WalletTransactionSerializer, TopUpSerializer
from . import providers


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'method', 'escrow_status']
    search_fields = [
        'transaction_ref', 'payer__username', 'payer__email',
        'booking__vehicle__plate', 'booking__vehicle__brand', 'booking__vehicle__model',
    ]
    ordering_fields = ['created_at', 'amount', 'status', 'paid_at', 'escrow_status']

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
    filterset_fields = ['status', 'method']
    search_fields = [
        'transaction_ref', 'recipient__username', 'recipient__email',
        'payment__booking__vehicle__plate', 'payment__booking__vehicle__brand',
    ]
    ordering_fields = ['created_at', 'processed_at', 'amount', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.role in ('ADMIN', 'CONTROLLER'):
            return Payout.objects.all()
        return Payout.objects.filter(recipient=user)


class WalletViewSet(viewsets.ViewSet):
    """Solde AutoLink — rechargement et historique."""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['reference', 'note', 'method', 'kind', 'status']
    ordering_fields = ['created_at', 'amount', 'kind', 'status']

    def list(self, request):
        transactions = request.user.wallet_transactions.all()
        for backend in self.filter_backends:
            transactions = backend().filter_queryset(request, transactions, self)
        return Response({
            'balance': request.user.balance,
            'transactions': WalletTransactionSerializer(
                transactions[:50], many=True
            ).data,
        })

    @action(detail=False, methods=['post'])
    def topup(self, request):
        serializer = TopUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data['amount']
        method = serializer.validated_data['method']
        ref = f'TOP-{uuid.uuid4().hex[:10].upper()}'
        if method in ('mtn', 'orange'):
            configured = providers.mtn_configured() if method == 'mtn' else providers.orange_configured()
            if not configured:
                return Response({'detail': 'Moyen de paiement non configuré.'}, status=503)
            phone = serializer.validated_data.get('phone')
            if not phone:
                return Response({'detail': 'Le numéro de téléphone est requis.'}, status=400)
            tx = WalletTransaction.objects.create(
                user=request.user, kind='topup', method=method, amount=amount,
                balance_after=request.user.balance or 0, reference=ref, status='pending')
            try:
                if method == 'mtn':
                    result = providers.mtn_request_to_pay(amount, phone, ref)
                    tx.provider_ref = result['provider_ref']
                    tx.provider_status = result['status']
                else:
                    result = providers.orange_create_payment(
                        amount, ref, ref,
                        f'{settings.FRONTEND_URL}/client/dashboard?topup=orange&ref={ref}',
                        f'{settings.FRONTEND_URL}/client/dashboard?topup=canceled',
                        self._abs(request, '/api/payments/orange-notification/'))
                    tx.provider_ref = ref
                    tx.provider_token = result['notif_token']
                    tx.provider_pay_token = result['pay_token']
                    tx.provider_status = 'PENDING'
                tx.save()
            except providers.ProviderError as error:
                tx.status = 'failed'
                tx.provider_status = 'ERROR'
                tx.note = str(error)[:200]
                tx.save(update_fields=['status', 'provider_status', 'note'])
                return Response({'detail': str(error)}, status=502)
            return Response({
                'reference': ref, 'status': tx.status,
                'payment_url': result.get('payment_url'),
                'transaction': WalletTransactionSerializer(tx).data,
            }, status=202)

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

        return Response({'detail': 'Moyen de paiement non configuré.'}, status=503)

    @action(detail=False, methods=['get'], url_path=r'transactions/(?P<reference>[^/.]+)/status')
    def transaction_status(self, request, reference=None):
        try:
            tx = WalletTransaction.objects.get(reference=reference, user=request.user, kind='topup')
        except WalletTransaction.DoesNotExist:
            return Response({'detail': 'Transaction introuvable.'}, status=404)
        if tx.status != 'pending':
            return Response(WalletTransactionSerializer(tx).data)
        if tx.method not in ('mtn', 'orange'):
            return Response(WalletTransactionSerializer(tx).data)
        try:
            raw = providers.mtn_status(tx.provider_ref) if tx.method == 'mtn' else providers.orange_status(
                tx.provider_ref, tx.amount, tx.provider_pay_token)
        except providers.ProviderError as error:
            return Response({'detail': str(error)}, status=502)
        _settle_wallet(tx, raw)
        tx.refresh_from_db()
        return Response(WalletTransactionSerializer(tx).data)

    @staticmethod
    def _abs(request, path):
        """URL absolue de l'API pour les redirections des providers."""
        return request.build_absolute_uri(path)


def _credit_wallet_tx(tx, note_suffix=''):
    """Crédite une recharge confirmée exactement une fois."""
    with db_transaction.atomic():
        tx = WalletTransaction.objects.select_for_update().get(pk=tx.pk)
        if tx.status != 'pending':
            return False
        user = tx.user.__class__.objects.select_for_update().get(pk=tx.user_id)
        user.balance = (user.balance or Decimal('0')) + tx.amount
        user.save(update_fields=['balance', 'updated_at'])
        tx.status = 'completed'
        tx.balance_after = user.balance
        if note_suffix:
            tx.note = f'{tx.note} {note_suffix}'
        tx.save(update_fields=['status', 'balance_after', 'note', 'provider_status'])
    return True


def _provider_success(raw):
    return str(raw.get('status', '')).upper() in ('SUCCESSFUL', 'SUCCESS', 'COMPLETED')


def _settle_wallet(tx, raw):
    status_value = str(raw.get('status', 'PENDING')).upper()
    with db_transaction.atomic():
        locked = WalletTransaction.objects.select_for_update().get(pk=tx.pk)
        locked.provider_status = status_value
        locked.save(update_fields=['provider_status'])
        if locked.status == 'pending' and _provider_success(raw):
            _credit_wallet_tx(locked, '(paiement confirmé)')
        elif locked.status == 'pending' and status_value in ('FAILED', 'ERROR', 'EXPIRED'):
            locked.status = 'failed'
            locked.save(update_fields=['status', 'provider_status'])
        else:
            locked.save(update_fields=['provider_status'])


def _settle_booking(payment, raw):
    with db_transaction.atomic():
        locked = Payment.objects.select_for_update().get(pk=payment.pk)
        locked.provider_status = str(raw.get('status', 'PENDING')).upper()
        if locked.status != 'pending':
            locked.save(update_fields=['provider_status'])
            return
        if _provider_success(raw):
            locked.status = 'completed'
            locked.paid_at = timezone.now()
            locked.save(update_fields=['status', 'paid_at', 'provider_status'])
            _confirm_booking_payment(locked)
        elif locked.provider_status in ('FAILED', 'ERROR', 'EXPIRED'):
            locked.status = 'failed'
            locked.save(update_fields=['status', 'provider_status'])


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


class PaymentMethodsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        methods = []
        if providers.mtn_configured():
            methods.append('mtn')
        if providers.orange_configured():
            methods.append('orange')
        if providers.stripe_configured():
            methods.append('stripe')
        if providers.paypal_configured():
            methods.append('paypal')
        return Response({'methods': methods, 'booking_methods': ['wallet', *methods]})


class OrangeNotificationView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        token = str(request.data.get('notif_token', ''))
        order_id = str(request.data.get('order_id', ''))
        tx = WalletTransaction.objects.filter(provider_ref=order_id, method='orange').first()
        payment = Payment.objects.filter(provider_ref=order_id, method='orange').first()
        expected = tx.provider_token if tx else payment.provider_token if payment else ''
        if not expected or not hmac.compare_digest(token, expected):
            return Response({'detail': 'Notification non autorisée.'}, status=403)
        try:
            amount = tx.amount if tx else payment.amount
            pay_token = tx.provider_pay_token if tx else payment.provider_pay_token
            raw = providers.orange_status(order_id, amount, pay_token)
        except providers.ProviderError as error:
            return Response({'detail': str(error)}, status=502)
        _settle_wallet(tx, raw) if tx else _settle_booking(payment, raw)
        return Response({'status': 'ok'})


class BookingPaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, reference):
        try:
            booking = Booking.objects.select_related('payment').get(pk=reference, client=request.user)
            payment = booking.payment
        except (Booking.DoesNotExist, Payment.DoesNotExist):
            return Response({'detail': 'Paiement introuvable.'}, status=404)
        if payment.status == 'pending' and payment.method in ('mtn', 'orange'):
            try:
                raw = providers.mtn_status(payment.provider_ref) if payment.method == 'mtn' else providers.orange_status(
                    payment.provider_ref, payment.amount, payment.provider_pay_token)
            except providers.ProviderError as error:
                return Response({'detail': str(error)}, status=502)
            _settle_booking(payment, raw)
            payment.refresh_from_db()
        return Response({'status': payment.status, 'provider_status': payment.provider_status})


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
