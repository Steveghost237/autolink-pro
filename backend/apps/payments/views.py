import uuid
from decimal import Decimal
from django.db import transaction as db_transaction
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Payment, Payout, WalletTransaction
from .serializers import PaymentSerializer, PayoutSerializer, WalletTransactionSerializer, TopUpSerializer


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

        with db_transaction.atomic():
            user = request.user.__class__.objects.select_for_update().get(pk=request.user.pk)
            user.balance = (user.balance or Decimal('0')) + amount
            user.save(update_fields=['balance', 'updated_at'])
            tx = WalletTransaction.objects.create(
                user=user, kind='topup', method=method, amount=amount,
                balance_after=user.balance,
                reference=f'TOP-{uuid.uuid4().hex[:10].upper()}',
                note=f'Rechargement via {method}',
            )
        return Response({
            'balance': user.balance,
            'transaction': WalletTransactionSerializer(tx).data,
        }, status=status.HTTP_201_CREATED)
