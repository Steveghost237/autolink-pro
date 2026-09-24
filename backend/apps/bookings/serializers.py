from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    client_email = serializers.CharField(source='client.email', read_only=True)
    client_phone = serializers.CharField(source='client.phone', read_only=True)
    vehicle_name = serializers.SerializerMethodField()
    vehicle_plate = serializers.CharField(source='vehicle.plate', read_only=True)
    vehicle_tier = serializers.CharField(source='vehicle.tier', read_only=True)
    driver_name = serializers.SerializerMethodField()
    driver_phone = serializers.CharField(source='driver.phone', read_only=True)
    payment_method = serializers.CharField(source='payment.method', read_only=True)
    payment_status = serializers.CharField(source='payment.status', read_only=True)
    escrow_status = serializers.CharField(source='payment.escrow_status', read_only=True)
    deposit_status = serializers.CharField(source='payment.deposit_status', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['client', 'driver', 'daily_rate', 'days', 'subtotal',
                            'commission_amount', 'owner_amount', 'discount_percent',
                            'deposit_amount',
                            'dispute_reason', 'dispute_opened_at',
                            'created_at', 'updated_at']

    def get_client_name(self, obj): return obj.client.get_full_name()
    def get_vehicle_name(self, obj): return str(obj.vehicle)
    def get_driver_name(self, obj): return obj.driver.get_full_name() if obj.driver else None

    def create(self, validated_data):
        vehicle = validated_data['vehicle']
        # Prix affiché (ajusté par le proprio dans la marge encadrée) + caution figée
        validated_data['daily_rate'] = vehicle.daily_rate or vehicle.computed_rate
        validated_data['deposit_amount'] = vehicle.deposit_amount or 0
        return super().create(validated_data)
