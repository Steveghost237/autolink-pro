from rest_framework import serializers
from pathlib import Path
from .models import Vehicle, VehiclePhoto, VehicleAvailability


class VehiclePhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = VehiclePhoto
        fields = ['id', 'image', 'kind', 'position', 'caption', 'uploaded_at']
        read_only_fields = fields

    def get_image(self, obj):
        if not obj.image:
            return ''
        url = obj.image.url
        request = self.context.get('request')
        return request.build_absolute_uri(url) if request else url


class VehicleMediaUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiclePhoto
        fields = ['image', 'kind', 'position', 'caption']

    def validate_image(self, file):
        # Accept all file types and sizes - stored in browser/local storage
        return file

    def validate(self, attrs):
        ext = Path(attrs['image'].name).suffix.lower()
        attrs['kind'] = 'video' if ext in {'.mp4', '.webm', '.mov', '.avi', '.mkv'} else 'image'
        return attrs


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

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user.role == 'OWNER' and attrs.get('status') not in (None, 'suspended'):
            raise serializers.ValidationError({'status': 'Le statut est géré par AutoLink.'})
        return attrs


class VehicleAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleAvailability
        fields = '__all__'
