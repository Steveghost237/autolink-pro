from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


COMMISSION_RATE = Decimal('0.25')


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        CONFIRMED = 'confirmed', 'Confirmé'
        ACTIVE = 'active', 'En cours'
        COMPLETED = 'completed', 'Terminé'
        CANCELLED = 'cancelled', 'Annulé'
        DISPUTED = 'disputed', 'Litige'

    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='bookings')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.PROTECT, related_name='bookings')
    driver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='driven_bookings')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    start_date = models.DateField()
    end_date = models.DateField()
    pickup_address = models.TextField(blank=True)
    dropoff_address = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    days = models.IntegerField(validators=[MinValueValidator(1)])
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2)
    owner_amount = models.DecimalField(max_digits=12, decimal_places=2)

    client_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    client_review = models.TextField(blank=True)
    driver_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Réservation'
        verbose_name_plural = 'Réservations'
        ordering = ['-created_at']

    def __str__(self):
        return f'BK-{self.pk:04d} — {self.client} / {self.vehicle}'

    def save(self, *args, **kwargs):
        if self.start_date and self.end_date:
            self.days = (self.end_date - self.start_date).days or 1
        self.subtotal = self.daily_rate * self.days
        self.commission_amount = (self.subtotal * COMMISSION_RATE).quantize(Decimal('0.01'))
        self.owner_amount = self.subtotal - self.commission_amount
        super().save(*args, **kwargs)
