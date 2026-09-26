from decimal import Decimal
from rest_framework import serializers
from .models import Payment, Payout, WalletTransaction

TOPUP_METHODS = ['mtn', 'orange', 'senbid', 'paybid', 'paypal', 'stripe']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['payer', 'commission', 'owner_payout', 'paid_at', 'payout_done', 'payout_at', 'created_at']

    def create(self, validated_data):
        booking = validated_data['booking']
        validated_data['amount'] = booking.subtotal
        validated_data['commission'] = booking.commission_amount
        validated_data['owner_payout'] = booking.owner_amount
        return super().create(validated_data)


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = '__all__'
        read_only_fields = ['processed_at', 'created_at']


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id', 'kind', 'method', 'amount', 'balance_after', 'reference', 'note', 'status', 'created_at']


class TopUpSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('500'))
    method = serializers.ChoiceField(choices=TOPUP_METHODS)
    phone = serializers.CharField(required=False, allow_blank=True)
