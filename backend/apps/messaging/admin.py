from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['sender', 'content', 'attachment', 'is_read', 'created_at']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'kind', 'subject', 'related_booking', 'updated_at']
    list_filter = ['kind']
    search_fields = ['subject', 'participants__email', 'participants__last_name']
    inlines = [MessageInline]
