from rest_framework import serializers
from .models import Agent, AgentPayout


class AgentSerializer(serializers.ModelSerializer):
    conversions = serializers.IntegerField(source='completed_bookings', read_only=True)
    generated_revenue = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    commission_earned = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    commission_due = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    payouts_total = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Agent
        fields = [
            'id', 'code', 'name', 'agent_type', 'phone', 'city', 'commission_rate',
            'is_active', 'created_at', 'conversions', 'generated_revenue',
            'commission_earned', 'payouts_total', 'commission_due',
        ]
        read_only_fields = ['id', 'code', 'created_at']


class AgentPayoutSerializer(serializers.ModelSerializer):
    agent_code = serializers.CharField(source='agent.code', read_only=True)
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    paid_by_name = serializers.CharField(source='paid_by.get_full_name', read_only=True)

    class Meta:
        model = AgentPayout
        fields = ['id', 'agent', 'agent_code', 'agent_name', 'amount', 'note', 'paid_by', 'paid_by_name', 'paid_at']
        read_only_fields = ['id', 'agent_code', 'agent_name', 'paid_by', 'paid_by_name', 'paid_at']
