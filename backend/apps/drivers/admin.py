from django.contrib import admin
from .models import DriverApplication, DriverProfile, DriverServiceRequest


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


@admin.register(DriverServiceRequest)
class DriverServiceRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'owner', 'drivers_count', 'city', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'city']
    search_fields = ['owner__username', 'owner__first_name', 'owner__last_name']
    readonly_fields = ['total_price', 'created_at', 'updated_at']
