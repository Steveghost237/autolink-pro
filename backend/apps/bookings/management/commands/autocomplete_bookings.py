from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.bookings.models import Booking


class Command(BaseCommand):
    """Termine les locations dont la date de fin est passée.

    À planifier en cron (ex. toutes les heures) :
        * * * * * python manage.py autocomplete_bookings
    Le même traitement tourne aussi à chaque requête de liste (filet de sécurité).
    """

    help = 'Clôture automatiquement les réservations expirées et libère les véhicules/cautions.'

    def handle(self, *args, **options):
        today = timezone.now().date()
        expired = Booking.objects.filter(
            status__in=('confirmed', 'active'),
            end_date__lt=today,
        ).select_related('vehicle', 'client', 'vehicle__owner')
        count = 0
        for booking in expired:
            booking.finish()
            count += 1
        self.stdout.write(self.style.SUCCESS(
            f'{count} location(s) terminée(s) automatiquement.'
        ))
