from django.contrib import admin
from .models import Agent, AgentPayout, AgentReferral


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'city', 'commission_rate', 'is_active', 'created_at']
    search_fields = ['code', 'name', 'phone', 'city']
    list_filter = ['is_active', 'city']


@admin.register(AgentReferral)
class AgentReferralAdmin(admin.ModelAdmin):
    list_display = ['agent', 'referred_user', 'created_at']
    search_fields = ['agent__code', 'referred_user__email']


@admin.register(AgentPayout)
class AgentPayoutAdmin(admin.ModelAdmin):
    list_display = ['agent', 'amount', 'paid_by', 'paid_at']
    search_fields = ['agent__code', 'note']
