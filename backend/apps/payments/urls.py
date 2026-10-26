from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet, PayoutViewSet, WalletViewSet,
    StripeReturnView, PayPalReturnView, StripeWebhookView,
    PaymentMethodsView, OrangeNotificationView, BookingPaymentStatusView,
)

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'payouts', PayoutViewSet, basename='payout')
router.register(r'wallet', WalletViewSet, basename='wallet')

urlpatterns = [
    # Retours après paiement hébergé (Stripe Checkout / PayPal) + webhook
    path('stripe-return/', StripeReturnView.as_view(), name='stripe-return'),
    path('paypal-return/', PayPalReturnView.as_view(), name='paypal-return'),
    path('stripe-webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('methods/', PaymentMethodsView.as_view(), name='payment-methods'),
    path('orange-notification/', OrangeNotificationView.as_view(), name='orange-notification'),
    path('bookings/<str:reference>/status/', BookingPaymentStatusView.as_view(), name='booking-payment-status'),
    path('', include(router.urls)),
]
