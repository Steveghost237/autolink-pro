import secrets

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        CLIENT = 'CLIENT', 'Client'
        OWNER = 'OWNER', 'Propriétaire'
        # DRIVER : rôle retiré de l'interface publique — les comptes et données
        # existants sont conservés en base (historiques, contrats, évaluations).
        DRIVER = 'DRIVER', 'Chauffeur'
        ADMIN = 'ADMIN', 'Administrateur'
        CONTROLLER = 'CONTROLLER', 'Contrôleur'
        INTERMEDIARY = 'INTERMEDIARY', 'Intermédiaire'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    newsletter_opt_in = models.BooleanField(default=True)
    language = models.CharField(
        max_length=2,
        choices=(('fr', 'Français'), ('en', 'English')),
        default='fr',
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    id_document = models.ImageField(upload_to='kyc/', null=True, blank=True)
    id_document_verified = models.BooleanField(default=False)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)

    # ── Intermédiaire (apporteur d'affaires) ────────────────────────────────
    # Code unique à partager : toute inscription ou réservation faite avec ce
    # code est rattachée à l'intermédiaire et génère une commission.
    referral_code = models.CharField(
        max_length=12, unique=True, null=True, blank=True,
        help_text="Code parrain de l'intermédiaire (ex. AL-4F2K9B).")
    commission_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=5,
        help_text='Commission intermédiaire en % du montant location — prélevée sur la part AutoLink.')
    referred_by = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='referrals',
        help_text='Intermédiaire dont le code a été utilisé à l\'inscription.')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def save(self, *args, **kwargs):
        # Génère un code parrain pour tout intermédiaire qui n'en a pas.
        if self.role == self.Role.INTERMEDIARY and not self.referral_code:
            while True:
                code = f'AL-{secrets.token_hex(3).upper()}'
                if not User.objects.filter(referral_code=code).exists():
                    self.referral_code = code
                    break
        super().save(*args, **kwargs)

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


class NewsletterCampaign(models.Model):
    subject = models.CharField(max_length=200)
    body = models.TextField()
    sent_at = models.DateTimeField(default=timezone.now)
    recipients_count = models.PositiveIntegerField(default=0)
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='newsletter_campaigns',
    )

    class Meta:
        ordering = ['-sent_at']
        verbose_name = 'Campagne newsletter'
        verbose_name_plural = 'Campagnes newsletter'

    def __str__(self):
        return self.subject


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


class Message(models.Model):
    """Message direct entre utilisateurs (client ↔ propriétaire ↔ support).
    recipient = None → message adressé à l'équipe support (visible par les admins)."""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True,
                                  related_name='received_messages')
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL,
                                null=True, blank=True, related_name='messages')
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Message'
        ordering = ['created_at']

    def __str__(self):
        to = self.recipient.get_full_name() if self.recipient else 'Support'
        return f'{self.sender.get_full_name()} → {to}'


class PlatformSettings(models.Model):
    """Configuration globale de la plateforme — singleton géré par l'admin."""
    commission_rate = models.DecimalField(
        max_digits=4, decimal_places=2, default='0.50',
        help_text='Part AutoLink sur chaque location (fraction, ex. 0.50 = 50 %).')
    intermediary_default_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default='5.00',
        help_text='Taux par défaut des nouveaux intermédiaires (en %).')
    driver_service_price = models.DecimalField(
        max_digits=10, decimal_places=2, default='75000',
        help_text='Forfait du service recrutement/formation chauffeur (FCFA).')
    support_email = models.EmailField(blank=True)
    support_phone = models.CharField(max_length=20, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='+')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Paramètres de la plateforme'
        verbose_name_plural = 'Paramètres de la plateforme'

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return 'Paramètres AutoLink'


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
