from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet, PayoutViewSet, WalletViewSet,
    StripeReturnView, PayPalReturnView, StripeWebhookView,
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
    path('', include(router.urls)),
]
