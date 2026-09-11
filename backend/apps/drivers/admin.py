from django.contrib import admin
from .models import DriverApplication, DriverProfile


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
