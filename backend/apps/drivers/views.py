from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import DriverApplication, DriverProfile, DriverServiceRequest
from .serializers import (DriverApplicationSerializer, DriverProfileSerializer,
                          DriverServiceRequestSerializer)


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


class DriverServiceRequestViewSet(viewsets.ModelViewSet):
    """Service recrutement/formation de chauffeurs pour propriétaires.
    Le propriétaire crée et suit ses demandes ; l'admin traite le pipeline."""
    serializer_class = DriverServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = DriverServiceRequest.objects.select_related('owner', 'processed_by')
        if self.request.user.role == 'ADMIN':
            return qs.all()
        return qs.filter(owner=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role not in ('OWNER', 'ADMIN'):
            raise PermissionDenied('Service réservé aux propriétaires de véhicules.')
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        # Seul l'admin fait avancer le pipeline (recrutement → formation → transmission)
        if self.request.user.role != 'ADMIN':
            raise PermissionDenied('Traitement réservé à l\'administration.')
        serializer.save(processed_by=self.request.user)
