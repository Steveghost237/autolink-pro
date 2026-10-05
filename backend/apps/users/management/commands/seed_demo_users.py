"""Comptes de démonstration — OPT-IN, jamais exécuté automatiquement.

    python manage.py seed_demo_users

Crée un utilisateur par rôle public (ADMIN existant via seed_demo, plus
OWNER / CLIENT / INTERMEDIARY). Mot de passe commun : DEMO_PASSWORD (env)
ou 'Demo2026!'. Les comptes sont clairement étiquetés « DEMO ».

À NE PAS exécuter en production — les comptes démo sont des accès connus.
"""
import secrets
from decimal import Decimal

from decouple import config
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User
from apps.vehicles.models import Vehicle
from apps.bookings.models import Booking
from apps.payments.models import Payment

DEMO_PASSWORD = config('DEMO_PASSWORD', default='Demo2026!')

DEMO_USERS = [
    dict(username='demo.admin',   email='demo.admin@autolink.com',
         first_name='Démo', last_name='ADMIN', role='ADMIN',
         phone='+237 6 90 00 00 01', is_staff=True, is_superuser=False),
    dict(username='demo.owner',   email='demo.owner@autolink.com',
         first_name='Démo', last_name='PROPRIÉTAIRE', role='OWNER',
         phone='+237 6 90 00 00 02'),
    dict(username='demo.client',  email='demo.client@autolink.com',
         first_name='Démo', last_name='CLIENT', role='CLIENT',
         phone='+237 6 90 00 00 03'),
    dict(username='demo.inter',   email='demo.inter@autolink.com',
         first_name='Démo', last_name='INTERMÉDIAIRE', role='INTERMEDIARY',
         phone='+237 6 90 00 00 04', commission_rate=5),
]

DEMO_VEHICLE = dict(
    brand='Toyota', model='Corolla', year=2021, plate='DEMO-001',
    category='Berline', fuel='essence', seats=5, color='Blanc',
    description='Véhicule de démonstration — compte propriétaire démo.',
    mode='platform', status='approved', daily_rate=30000,
    insurance_type='premium', mileage=42000, city='Douala',
    market_value=15000000, condition_score=92,
)


class Command(BaseCommand):
    help = 'Crée les 4 comptes de démonstration (opt-in, hors production)'

    def handle(self, *args, **options):
        created_users = {}
        for spec in DEMO_USERS:
            user, created = User.objects.get_or_create(
                username=spec['username'],
                defaults={**spec, 'is_verified': True},
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            created_users[spec['role']] = user
            extra = f' — code parrain : {user.referral_code}' if user.role == 'INTERMEDIARY' else ''
            self.stdout.write(
                f"{'créé' if created else 'existant'} : {spec['email']}{extra}")

        owner = created_users['OWNER']
        client = created_users['CLIENT']
        agent = created_users['INTERMEDIARY']

        # Véhicule de démo rattaché au propriétaire démo
        vehicle, v_created = Vehicle.objects.get_or_create(
            plate=DEMO_VEHICLE['plate'],
            defaults={**DEMO_VEHICLE, 'owner': owner,
                      'insurance_expiry': timezone.now().date() + timedelta(days=365)},
        )
        if v_created:
            self.stdout.write(f'véhicule démo : {vehicle}')

        # Une réservation démo attribuée à l'intermédiaire (payée via wallet
        # fictif — simple ligne Payment, pas de débit réel).
        if not Booking.objects.filter(client=client, vehicle=vehicle).exists():
            vehicle.refresh_from_db()  # daily_rate déjà converti en Decimal par le save()
            start = timezone.now().date() + timedelta(days=7)
            booking = Booking.objects.create(
                client=client, vehicle=vehicle, intermediary=agent,
                start_date=start, end_date=start + timedelta(days=3),
                daily_rate=Decimal(str(vehicle.daily_rate)),
                deposit_amount=Decimal(str(vehicle.deposit_amount or 0)),
                status='confirmed', notes='Réservation de démonstration',
            )
            Payment.objects.create(
                booking=booking, payer=client, method='wallet',
                status='completed', amount=booking.subtotal,
                commission=booking.commission_amount,
                owner_payout=booking.owner_amount,
                escrow_status='held', deposit_amount=booking.deposit_amount,
                deposit_status='held',
                transaction_ref=f'DEMO-{secrets.token_hex(4).upper()}',
                paid_at=timezone.now(),
            )
            self.stdout.write(f'réservation démo : {booking}')

        self.stdout.write(self.style.SUCCESS(
            f'\nComptes démo prêts — mot de passe commun : {DEMO_PASSWORD}\n'
            '  Admin        : demo.admin@autolink.com\n'
            '  Propriétaire : demo.owner@autolink.com\n'
            '  Client       : demo.client@autolink.com\n'
            f"  Intermédiaire: demo.inter@autolink.com (code {agent.referral_code})"
        ))
