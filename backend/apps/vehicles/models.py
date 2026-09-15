from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Vehicle(models.Model):
    class Mode(models.TextChoices):
        PLATFORM = 'platform', 'Confié à AutoLink'
        HOME = 'home', 'Chez le propriétaire (à la demande)'

    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente de validation'
        APPROVED = 'approved', 'Approuvé'
        RENTED = 'rented', 'En location'
        MAINTENANCE = 'maintenance', 'En maintenance'
        SUSPENDED = 'suspended', 'Suspendu'

    class Tier(models.TextChoices):
        BASIC = 'basic', 'Basic'
        STANDARD = 'standard', 'Standard'
        PREMIUM = 'premium', 'Premium'
        GOLD = 'gold', 'Gold'

    class Fuel(models.TextChoices):
        ESSENCE = 'essence', 'Essence'
        DIESEL = 'diesel', 'Diesel'
        HYBRID = 'hybrid', 'Hybride'
        ELECTRIC = 'electric', 'Électrique'

    class InsuranceType(models.TextChoices):
        STANDARD = 'standard', 'Standard'
        PREMIUM = 'premium', 'Premium'
        ALL_RISK = 'all_risk', 'Tous risques'

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles')
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField(validators=[MinValueValidator(2000), MaxValueValidator(2030)])
    plate = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=50)
    tier = models.CharField(max_length=20, choices=Tier.choices, default=Tier.STANDARD)
    fuel = models.CharField(max_length=20, choices=Fuel.choices)
    seats = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(50)])
    color = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    mode = models.CharField(max_length=20, choices=Mode.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    computed_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    insurance_type = models.CharField(max_length=20, choices=InsuranceType.choices)
    insurance_expiry = models.DateField()
    technical_control_date = models.DateField(null=True, blank=True)
    condition_score = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])

    mileage = models.IntegerField(default=0)
    fuel_level = models.IntegerField(default=100, validators=[MinValueValidator(0), MaxValueValidator(100)])

    total_bookings = models.IntegerField(default=0)
    total_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Véhicule'
        verbose_name_plural = 'Véhicules'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.brand} {self.model} {self.year} ({self.plate})'

    def compute_rate(self):
        base = float(self.daily_rate)
        age = 2025 - self.year
        if age <= 2:
            base += 5000
        elif age <= 5:
            base += 2000
        if self.insurance_type in ['premium', 'all_risk']:
            base += 2000
        condition_bonus = round((self.condition_score / 100) * 5000)
        return base + condition_bonus

    def save(self, *args, **kwargs):
        self.computed_rate = self.compute_rate()
        if not self.tier:
            rate = float(self.daily_rate)
            if rate < 25000:
                self.tier = 'basic'
            elif rate < 55000:
                self.tier = 'standard'
            elif rate < 90000:
                self.tier = 'premium'
            else:
                self.tier = 'gold'
        super().save(*args, **kwargs)


class VehiclePhoto(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='vehicles/')
    caption = models.CharField(max_length=100, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Photo de {self.vehicle}'


class VehicleAvailability(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='unavailable_periods')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = 'Indisponibilité'

    def __str__(self):
        return f'{self.vehicle} — {self.start_date} au {self.end_date}'
