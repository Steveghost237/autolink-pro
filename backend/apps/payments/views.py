from rest_framework import viewsets, permissions
from .models import Payment, Payout
from .serializers import PaymentSerializer, PayoutSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Payment.objects.all()
        return Payment.objects.filter(payer=user)

    def perform_create(self, serializer):
        serializer.save(payer=self.request.user)


class PayoutViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Payout.objects.all()
        return Payout.objects.filter(recipient=user)
