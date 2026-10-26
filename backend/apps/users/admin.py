from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import ContactMessage, NewsletterCampaign, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'get_full_name', 'role', 'is_verified', 'is_active', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('AutoLink Info', {'fields': ('role', 'phone', 'avatar', 'is_verified', 'newsletter_opt_in', 'id_document', 'id_document_verified', 'date_of_birth', 'address')}),
    )


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
