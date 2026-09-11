from django.contrib import admin
from .models import Payment, Payout


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'method', 'status', 'amount', 'commission', 'owner_payout', 'payout_done', 'paid_at']
    list_filter = ['status', 'method', 'payout_done']
    readonly_fields = ['amount', 'commission', 'owner_payout', 'paid_at', 'created_at']


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'recipient', 'amount', 'method', 'status', 'processed_at']
    list_filter = ['status', 'method']
