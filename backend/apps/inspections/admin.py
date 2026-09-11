from django.contrib import admin
from .models import VehicleInspection, InspectionPhoto


class InspectionPhotoInline(admin.TabularInline):
    model = InspectionPhoto
    extra = 1


@admin.register(VehicleInspection)
class VehicleInspectionAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'inspection_type', 'vehicle', 'controller', 'condition_score', 'fuel_level', 'mileage_at_inspection', 'inspection_date']
    list_filter = ['inspection_type', 'inspection_date']
    search_fields = ['vehicle__plate', 'vehicle__brand', 'controller__username']
    inlines = [InspectionPhotoInline]
    readonly_fields = ['inspection_date']
