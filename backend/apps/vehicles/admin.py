from django.contrib import admin
from .models import Vehicle, VehiclePhoto, VehicleAvailability


class VehiclePhotoInline(admin.TabularInline):
    model = VehiclePhoto
    extra = 1


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'owner', 'category', 'status', 'mode', 'computed_rate', 'condition_score', 'total_bookings', 'rating']
    list_filter = ['status', 'mode', 'category', 'fuel', 'insurance_type']
    search_fields = ['brand', 'model', 'plate', 'owner__username']
    inlines = [VehiclePhotoInline]
    readonly_fields = ['computed_rate', 'total_bookings', 'total_earned', 'rating', 'rating_count', 'created_at', 'updated_at']


admin.site.register(VehicleAvailability)
