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
