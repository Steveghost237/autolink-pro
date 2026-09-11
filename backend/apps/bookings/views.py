from rest_framework import viewsets, permissions
from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Booking.objects.all()
        if user.role == 'CLIENT':
            return Booking.objects.filter(client=user)
        if user.role == 'DRIVER':
            return Booking.objects.filter(driver=user)
        if user.role == 'OWNER':
            return Booking.objects.filter(vehicle__owner=user)
        return Booking.objects.none()

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
