from rest_framework import viewsets, permissions
from django.utils import timezone
from .models import DriverApplication, DriverProfile
from .serializers import DriverApplicationSerializer, DriverProfileSerializer


class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return getattr(obj, 'applicant', None) == request.user or getattr(obj, 'driver', None) == request.user


class DriverApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = DriverApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return DriverApplication.objects.all()
        return DriverApplication.objects.filter(applicant=self.request.user)

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    def perform_update(self, serializer):
        if self.request.user.role == 'ADMIN':
            serializer.save(reviewer=self.request.user, reviewed_at=timezone.now())
        else:
            serializer.save()


class DriverProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return DriverProfile.objects.all()
        return DriverProfile.objects.filter(driver=self.request.user)
