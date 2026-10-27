from django.conf import settings
from django.db import models


class Conversation(models.Model):
    """Fil de discussion entre utilisateurs (réservation ou support AutoLink)."""

    class Kind(models.TextChoices):
        BOOKING = 'booking', 'Réservation'
        SUPPORT = 'support', 'Support AutoLink'
        DIRECT = 'direct', 'Direct'

    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.DIRECT)
    subject = models.CharField(max_length=200, blank=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    related_booking = models.ForeignKey(
        'bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-updated_at']

    def __str__(self):
        return self.subject or f'Conversation #{self.pk}'


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True)
    attachment = models.FileField(upload_to='messages/', null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']

    def __str__(self):
        return f'Message de {self.sender} ({self.created_at:%d/%m %H:%M})'
