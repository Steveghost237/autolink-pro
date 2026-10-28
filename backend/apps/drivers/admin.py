from django.contrib import admin
from .models import DriverApplication, DriverEarning, DriverProfile


@admin.register(DriverApplication)
class DriverApplicationAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'status', 'experience_years', 'compliance_score', 'applied_at', 'reviewed_at']
    list_filter = ['status']
    search_fields = ['applicant__username', 'applicant__first_name', 'applicant__last_name']
    readonly_fields = ['compliance_score', 'applied_at', 'reviewed_at']


@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ['driver', 'assigned_vehicle', 'rating', 'total_trips', 'total_earned', 'is_online']
    list_filter = ['is_online']
    readonly_fields = ['total_trips', 'total_earned', 'rating', 'rating_count']


@admin.register(DriverEarning)
class DriverEarningAdmin(admin.ModelAdmin):
    list_display = ['driver', 'booking', 'amount', 'created_at']
    search_fields = ['driver__username', 'booking__vehicle__brand', 'booking__vehicle__model']
    list_filter = ['created_at']
