from rest_framework import serializers
from .models import DriverApplication, DriverProfile, DriverServiceRequest


class DriverApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    compliance_score = serializers.ReadOnlyField()

    class Meta:
        model = DriverApplication
        fields = '__all__'
        read_only_fields = ['applicant', 'reviewer', 'applied_at', 'reviewed_at']

    def get_applicant_name(self, obj):
        return obj.applicant.get_full_name()


class DriverProfileSerializer(serializers.ModelSerializer):
    driver_name = serializers.SerializerMethodField()

    class Meta:
        model = DriverProfile
        fields = '__all__'
        read_only_fields = ['total_trips', 'total_earned', 'rating', 'rating_count', 'certified_at']

    def get_driver_name(self, obj):
        return obj.driver.get_full_name()


class DriverServiceRequestSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    owner_phone = serializers.CharField(source='owner.phone', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = DriverServiceRequest
        fields = '__all__'
        read_only_fields = ['owner', 'status', 'admin_notes', 'processed_by',
                            'created_at', 'updated_at']

    def get_owner_name(self, obj):
        return obj.owner.get_full_name()
