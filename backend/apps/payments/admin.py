from django.contrib import admin
from .models import Payment, Payout, WithdrawalRequest


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'method', 'status', 'amount', 'commission', 'owner_payout', 'payout_done', 'paid_at']
    list_filter = ['status', 'method', 'payout_done']
    readonly_fields = ['amount', 'commission', 'owner_payout', 'paid_at', 'created_at']


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'recipient', 'amount', 'method', 'status', 'processed_at']
    list_filter = ['status', 'method']


@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ['reference', 'user', 'amount', 'method', 'phone', 'status', 'created_at', 'processed_at']
    list_filter = ['status', 'method']
    search_fields = ['reference', 'phone', 'user__email', 'user__last_name']
    readonly_fields = ['reference', 'amount', 'created_at', 'processed_at', 'processed_by']
