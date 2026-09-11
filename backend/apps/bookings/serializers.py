from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()
    driver_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['client', 'days', 'subtotal', 'commission_amount', 'owner_amount', 'created_at', 'updated_at']

    def get_client_name(self, obj): return obj.client.get_full_name()
    def get_vehicle_name(self, obj): return str(obj.vehicle)
    def get_driver_name(self, obj): return obj.driver.get_full_name() if obj.driver else None

    def create(self, validated_data):
        vehicle = validated_data['vehicle']
        validated_data['daily_rate'] = vehicle.computed_rate or vehicle.daily_rate
        return super().create(validated_data)
