from rest_framework import serializers
from .models import VehicleInspection, InspectionPhoto


class InspectionPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionPhoto
        fields = ['id', 'image', 'caption', 'uploaded_at']


class VehicleInspectionSerializer(serializers.ModelSerializer):
    photos = InspectionPhotoSerializer(many=True, read_only=True)
    controller_name = serializers.SerializerMethodField()

    class Meta:
        model = VehicleInspection
        fields = '__all__'
        read_only_fields = ['controller', 'inspection_date']

    def get_controller_name(self, obj):
        return obj.controller.get_full_name() if obj.controller else None
