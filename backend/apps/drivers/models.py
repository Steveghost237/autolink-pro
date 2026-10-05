from django.db import models
from django.conf import settings


class DriverApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        REVIEW = 'review', 'En examen'
        APPROVED = 'approved', 'Approuvé'
        REJECTED = 'rejected', 'Refusé'

    applicant = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_application')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    experience_years = models.IntegerField(default=0)
    has_valid_license = models.BooleanField(default=False)
    license_number = models.CharField(max_length=50, blank=True)
    license_expiry = models.DateField(null=True, blank=True)
    license_document = models.ImageField(upload_to='drivers/licenses/', null=True, blank=True)
    has_clean_criminal_record = models.BooleanField(default=False)
    criminal_record_document = models.ImageField(upload_to='drivers/criminal/', null=True, blank=True)
    has_medical_certificate = models.BooleanField(default=False)
    medical_certificate_document = models.ImageField(upload_to='drivers/medical/', null=True, blank=True)
    driving_test_passed = models.BooleanField(default=False)
    driving_test_score = models.IntegerField(null=True, blank=True)
    training_completed = models.BooleanField(default=False)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    reviewer_notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Candidature chauffeur"
        verbose_name_plural = "Candidatures chauffeurs"

    def __str__(self):
        return f'{self.applicant.get_full_name()} — {self.status}'

    @property
    def compliance_score(self):
        checks = [
            self.has_valid_license,
            self.has_clean_criminal_record,
            self.has_medical_certificate,
            self.driving_test_passed,
            self.training_completed,
            bool(self.license_document),
            bool(self.criminal_record_document),
            bool(self.medical_certificate_document),
            self.experience_years >= 2,
        ]
        return round((sum(checks) / len(checks)) * 100)


class DriverProfile(models.Model):
    driver = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_profile')
    assigned_vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.IntegerField(default=0)
    total_trips = models.IntegerField(default=0)
    total_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    acceptance_rate = models.IntegerField(default=100)
    on_time_rate = models.IntegerField(default=100)
    is_online = models.BooleanField(default=False)
    certified_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Profil chauffeur"

    def __str__(self):
        return f'Chauffeur: {self.driver.get_full_name()}'


class DriverServiceRequest(models.Model):
    """Service payant : un propriétaire sans chauffeur attitré confie à
    AutoLink le recrutement, la vérification (éthique, valeurs, expérience)
    et la formation d'un ou plusieurs chauffeurs. Après transmission, le
    chauffeur est entièrement et exclusivement géré par le propriétaire."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        RECRUITING = 'recruiting', 'Recrutement en cours'
        TRAINING = 'training', 'Formation en cours'
        DELIVERED = 'delivered', 'Chauffeur transmis'
        CANCELLED = 'cancelled', 'Annulée'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='driver_service_requests')
    drivers_count = models.IntegerField(default=1)
    city = models.CharField(max_length=50, default='Douala')
    requirements = models.TextField(
        blank=True,
        help_text='Critères particuliers du propriétaire (expérience, zone, type de véhicule…)')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=75000,
        help_text='Forfait par chauffeur recruté et formé (FCFA).')
    admin_notes = models.TextField(blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='processed_driver_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Demande de service chauffeur"
        verbose_name_plural = "Demandes de service chauffeur"
        ordering = ['-created_at']

    @property
    def total_price(self):
        return self.price * self.drivers_count

    def __str__(self):
        return f'DSR-{self.pk:04d} — {self.owner.get_full_name()} ({self.drivers_count} chauffeur(s))'
