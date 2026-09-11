from rest_framework import viewsets, permissions
from .models import VehicleInspection
from .serializers import VehicleInspectionSerializer


class IsControllerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['ADMIN', 'CONTROLLER']


class VehicleInspectionViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleInspectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsControllerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'CONTROLLER']:
            return VehicleInspection.objects.all()
        if user.role == 'OWNER':
            return VehicleInspection.objects.filter(vehicle__owner=user)
        if user.role == 'CLIENT':
            return VehicleInspection.objects.filter(booking__client=user)
        return VehicleInspection.objects.none()

    def perform_create(self, serializer):
        serializer.save(controller=self.request.user)
