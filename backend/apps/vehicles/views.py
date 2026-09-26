from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vehicle, VehicleAvailability
from .serializers import VehicleSerializer, VehicleAvailabilitySerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user or request.user.role in ('ADMIN', 'CONTROLLER') or request.user.is_staff


class VehicleViewSet(ModelViewSet):
    queryset = Vehicle.objects.filter(status='approved')
    serializer_class = VehicleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'fuel', 'status', 'mode', 'insurance_type']
    search_fields = ['brand', 'model', 'plate', 'category']
    ordering_fields = ['computed_rate', 'rating', 'year', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status='pending')

    def get_queryset(self):
        qs = Vehicle.objects.all()
        if self.request.user.is_authenticated:
            if self.request.user.role in ['ADMIN', 'CONTROLLER']:
                return qs
            # Le propriétaire gère ses véhicules via ?mine=1 ; sinon il peut
            # aussi parcourir le catalogue public et louer comme un client.
            if self.request.user.role == 'OWNER' and self.request.query_params.get('mine'):
                return qs.filter(owner=self.request.user)
        return qs.filter(status='approved')


class VehicleAvailabilityView(generics.ListCreateAPIView):
    serializer_class = VehicleAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VehicleAvailability.objects.filter(vehicle_id=self.kwargs['vehicle_id'])

    def perform_create(self, serializer):
        serializer.save(vehicle_id=self.kwargs['vehicle_id'])
