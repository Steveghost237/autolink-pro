from rest_framework import serializers
from .models import Vehicle, VehiclePhoto, VehicleAvailability


class VehiclePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiclePhoto
        fields = ['id', 'image', 'caption', 'uploaded_at']


class VehicleSerializer(serializers.ModelSerializer):
    photos = VehiclePhotoSerializer(many=True, read_only=True)
    owner_name = serializers.SerializerMethodField()
    price_min = serializers.ReadOnlyField()
    price_max = serializers.ReadOnlyField()
    tier_label = serializers.CharField(source='get_tier_display', read_only=True)

    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['owner', 'tier', 'computed_rate', 'deposit_amount', 'km_included_per_day',
                            'extra_km_rate', 'total_bookings', 'total_earned',
                            'rating', 'rating_count', 'created_at', 'updated_at']

    def get_owner_name(self, obj):
        return obj.owner.get_full_name()


class VehicleAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleAvailability
        fields = '__all__'
