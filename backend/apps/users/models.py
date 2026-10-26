from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        CLIENT = 'CLIENT', 'Client'
        OWNER = 'OWNER', 'Propriétaire'
        DRIVER = 'DRIVER', 'Chauffeur'
        ADMIN = 'ADMIN', 'Administrateur'
        CONTROLLER = 'CONTROLLER', 'Contrôleur'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    id_document = models.ImageField(upload_to='kyc/', null=True, blank=True)
    id_document_verified = models.BooleanField(default=False)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return f'{self.get_full_name()} ({self.role})'


class ContactMessage(models.Model):
    last_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    rental_type = models.CharField(max_length=120, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_handled = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Message de contact'
        verbose_name_plural = 'Messages de contact'

    def __str__(self):
        return f'{self.first_name} {self.last_name} — {self.created_at:%Y-%m-%d}'


class Notification(models.Model):
    """Notification interne — propriétaire notifié d'une réservation, fin de location, litige…"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notification'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} → {self.user}'


class LoginCode(models.Model):
    """Code OTP de connexion envoyé par email (connexion sans mot de passe)."""
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    first_name = models.CharField(max_length=80, blank=True)
    last_name = models.CharField(max_length=80, blank=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Code de connexion'
        ordering = ['-created_at']

    def __str__(self):
        return f'OTP {self.email} ({self.code})'
