from rest_framework import serializers
from django.db import transaction
from .models import VehicleInspection, InspectionPhoto


class InspectionPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionPhoto
        fields = ['id', 'image', 'caption', 'uploaded_at']


class VehicleInspectionSerializer(serializers.ModelSerializer):
    photos = InspectionPhotoSerializer(many=True, read_only=True)
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False)
    controller_name = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()
    vehicle_plate = serializers.CharField(source='vehicle.plate', read_only=True)

    class Meta:
        model = VehicleInspection
        fields = '__all__'
        read_only_fields = ['controller', 'inspection_date']

    def get_controller_name(self, obj):
        return obj.controller.get_full_name() if obj.controller else None

    def get_vehicle_name(self, obj):
        return f'{obj.vehicle.brand} {obj.vehicle.model} {obj.vehicle.year}'

    @transaction.atomic
    def create(self, validated_data):
        files = validated_data.pop('uploaded_photos', [])
        inspection = super().create(validated_data)
        for image in files:
            InspectionPhoto.objects.create(
                inspection=inspection, image=image, caption='Photo inspection')
        return inspection
