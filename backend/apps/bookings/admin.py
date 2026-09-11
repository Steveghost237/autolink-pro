from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'status', 'start_date', 'end_date', 'days', 'subtotal', 'commission_amount', 'owner_amount', 'created_at']
    list_filter = ['status', 'start_date']
    search_fields = ['client__username', 'vehicle__plate', 'vehicle__brand']
    readonly_fields = ['days', 'subtotal', 'commission_amount', 'owner_amount', 'created_at', 'updated_at']
