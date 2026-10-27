from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import ContactMessage, Message, NewsletterCampaign, PlatformSettings, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'get_full_name', 'role', 'is_verified', 'is_active', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('AutoLink Info', {'fields': ('role', 'phone', 'avatar', 'is_verified', 'newsletter_opt_in', 'id_document', 'id_document_verified', 'date_of_birth', 'address')}),
        ('Intermédiaire', {'fields': ('referral_code', 'commission_rate', 'referred_by')}),
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'recipient', 'is_read', 'created_at']
    list_filter = ['is_read']
    search_fields = ['sender__username', 'sender__email', 'recipient__email', 'body']


@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    list_display = ['id', 'commission_rate', 'intermediary_default_rate',
                    'driver_service_price', 'updated_at']

    def has_add_permission(self, request):
        return not PlatformSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['last_name', 'first_name', 'phone', 'email', 'rental_type', 'created_at', 'is_handled']
    list_filter = ['is_handled', 'rental_type', 'created_at']
    search_fields = ['last_name', 'first_name', 'phone', 'email', 'message']


@admin.register(NewsletterCampaign)
class NewsletterCampaignAdmin(admin.ModelAdmin):
    list_display = ['subject', 'sent_at', 'recipients_count', 'sent_by']
    search_fields = ['subject', 'body']
    ordering = ['-sent_at']
