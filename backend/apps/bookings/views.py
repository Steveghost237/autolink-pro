from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Sum, Count
from .models import Booking
from .serializers import BookingSerializer

# Transitions autorisées par rôle hors admin
CLIENT_ALLOWED_STATUS = {'cancelled'}
CLIENT_CANCELLABLE = {'pending', 'confirmed'}
DRIVER_ALLOWED_STATUS = {'active', 'completed'}


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'vehicle']
    ordering_fields = ['created_at', 'start_date', 'subtotal']

    def get_queryset(self):
        user = self.request.user
        if user.role in ('ADMIN', 'CONTROLLER'):
            return Booking.objects.all()
        if user.role == 'CLIENT':
            return Booking.objects.filter(client=user)
        if user.role == 'DRIVER':
            return Booking.objects.filter(driver=user)
        if user.role == 'OWNER':
            return Booking.objects.filter(vehicle__owner=user)
        return Booking.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == 'ADMIN' and self.request.data.get('client'):
            serializer.save(client_id=self.request.data['client'])
        else:
            serializer.save(client=self.request.user)

    @staticmethod
    def _sync_vehicle_status(booking):
        """Le véhicule redevient immédiatement disponible dès la fin d'une location."""
        vehicle = booking.vehicle
        if booking.status in ('confirmed', 'active'):
            if vehicle.status == 'approved':
                vehicle.status = 'rented'
                vehicle.save(update_fields=['status', 'updated_at'])
        elif booking.status in ('completed', 'cancelled'):
            if vehicle.status in ('rented', 'maintenance'):
                vehicle.status = 'approved'
                vehicle.save(update_fields=['status', 'updated_at'])

    def perform_update(self, serializer):
        """Contrôle des transitions de statut selon le rôle."""
        booking = self.get_object()
        user = self.request.user
        new_status = self.request.data.get('status')

        if user.role in ('ADMIN', 'CONTROLLER'):
            serializer.save()
            self._sync_vehicle_status(serializer.instance)
            return

        if new_status is None:
            raise PermissionDenied('Modification réservée à l\'administration.')

        if user.role == 'CLIENT':
            if booking.client_id != user.id:
                raise PermissionDenied('Cette réservation ne vous appartient pas.')
            if new_status not in CLIENT_ALLOWED_STATUS:
                raise PermissionDenied('Action non autorisée.')
            if booking.status not in CLIENT_CANCELLABLE:
                raise ValidationError({'status': 'Cette réservation ne peut plus être annulée.'})
            serializer.save(status='cancelled')
            self._sync_vehicle_status(serializer.instance)
            return

        if user.role == 'DRIVER':
            if booking.driver_id != user.id:
                raise PermissionDenied('Cette course ne vous est pas assignée.')
            if new_status not in DRIVER_ALLOWED_STATUS:
                raise PermissionDenied('Action non autorisée.')
            serializer.save(status=new_status)
            self._sync_vehicle_status(serializer.instance)
            return

        raise PermissionDenied('Modification réservée à l\'administration.')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques globales — réservé ADMIN/CONTROLLER."""
        if request.user.role not in ('ADMIN', 'CONTROLLER'):
            return Response({'detail': 'Non autorisé.'}, status=403)

        from apps.users.models import User
        from apps.vehicles.models import Vehicle

        agg = Booking.objects.aggregate(
            total=Count('id'),
            revenue=Sum('subtotal'),
            commission=Sum('commission_amount'),
        )
        by_status = dict(
            Booking.objects.values_list('status').annotate(n=Count('id'))
        )
        return Response({
            'users': User.objects.count(),
            'vehicles': Vehicle.objects.count(),
            'vehicles_pending': Vehicle.objects.filter(status='pending').count(),
            'bookings_total': agg['total'] or 0,
            'bookings_pending': by_status.get('pending', 0),
            'bookings_active': by_status.get('active', 0) + by_status.get('confirmed', 0),
            'revenue_total': agg['revenue'] or 0,
            'commission_total': agg['commission'] or 0,
        })
