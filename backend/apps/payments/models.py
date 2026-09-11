from django.db import models
from django.conf import settings
from decimal import Decimal


class Payment(models.Model):
    class Method(models.TextChoices):
        MTN = 'mtn', 'MTN Mobile Money'
        ORANGE = 'orange', 'Orange Money'
        PAYPAL = 'paypal', 'PayPal'
        STRIPE = 'stripe', 'Stripe (Carte)'

    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        COMPLETED = 'completed', 'Confirmé'
        FAILED = 'failed', 'Échoué'
        REFUNDED = 'refunded', 'Remboursé'

    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='payment')
    payer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    method = models.CharField(max_length=20, choices=Method.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    commission = models.DecimalField(max_digits=12, decimal_places=2)
    owner_payout = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_ref = models.CharField(max_length=200, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    payout_done = models.BooleanField(default=False)
    payout_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'
        ordering = ['-created_at']

    def __str__(self):
        return f'PAY-{self.pk:04d} — {self.amount} FCFA ({self.status})'


class Payout(models.Model):
    """Reversement de la part propriétaire/chauffeur."""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='payouts')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=Payment.Method.choices)
    status = models.CharField(max_length=20, choices=Payment.Status.choices, default=Payment.Status.PENDING)
    transaction_ref = models.CharField(max_length=200, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Versement'
        verbose_name_plural = 'Versements'

    def __str__(self):
        return f'PAYOUT-{self.pk:04d} — {self.amount} FCFA → {self.recipient}'
