from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.vehicles.models import Vehicle
from apps.bookings.models import Booking


DEMO_USERS = [
    dict(username='client',     email='client@autolink.com',     first_name='Marie',  last_name='Mballa',   role='CLIENT',     phone='+237675123456'),
    dict(username='driver',     email='driver@autolink.com',     first_name='Armand', last_name='Nkounga',  role='DRIVER',     phone='+237699887700', is_verified=True),
    dict(username='driver2',    email='driver2@autolink.com',    first_name='Samuel', last_name='Etoundi',  role='DRIVER',     phone='+237690112233', is_verified=True),
    dict(username='driver3',    email='driver3@autolink.com',    first_name='Eric',   last_name='Fotso',    role='DRIVER',     phone='+237677889900', is_verified=True),
    dict(username='owner',      email='owner@autolink.com',      first_name='Jean',   last_name='Kouassi',  role='OWNER',      phone='+237655223344', is_verified=True),
    dict(username='admin',      email='admin@autolink.com',      first_name='Admin',  last_name='AutoLink', role='ADMIN',      phone='+237222200001', is_verified=True, is_staff=True, is_superuser=True),
    dict(username='controller', email='controller@autolink.com', first_name='Paul',   last_name='Diallo',   role='CONTROLLER', phone='+237654445566', is_verified=True),
]

# 60+ véhicules réels parmi les plus utilisés au Cameroun
# tier: basic (<25k) / standard (25-55k) / premium (55-90k) / gold (>90k)
def _v(brand, model, year, plate, category, fuel, seats, color, rate, tier, insurance='standard', score=90, status='approved'):
    return dict(brand=brand, model=model, year=year, plate=plate, category=category, fuel=fuel,
                seats=seats, color=color, daily_rate=rate, tier=tier, insurance_type=insurance,
                status=status, condition_score=score, mode='platform')

DEMO_VEHICLES = [
    # ── BASIC — citadines & berlines économiques (< 25 000 F/jour) ──
    _v('Toyota', 'Yaris', 2019, 'LT-0001-B', 'Citadine', 'essence', 5, 'Blanc', 18000, 'basic', score=88),
    _v('Toyota', 'Corolla', 2016, 'LT-0002-B', 'Berline', 'essence', 5, 'Gris', 20000, 'basic', score=85),
    _v('Toyota', 'Camry', 2015, 'CE-0003-B', 'Berline', 'essence', 5, 'Noir', 22000, 'basic', score=82),
    _v('Toyota', 'Avensis', 2014, 'LT-0004-B', 'Berline', 'diesel', 5, 'Argent', 20000, 'basic', score=80),
    _v('Toyota', 'Starlet', 2021, 'LT-0005-B', 'Citadine', 'essence', 5, 'Rouge', 19000, 'basic', score=92),
    _v('Honda', 'Civic', 2017, 'LT-0006-B', 'Berline', 'essence', 5, 'Bleu', 21000, 'basic', score=84),
    _v('Honda', 'Accord', 2015, 'CE-0007-B', 'Berline', 'essence', 5, 'Noir', 23000, 'basic', score=81),
    _v('Hyundai', 'Accent', 2019, 'LT-0008-B', 'Citadine', 'essence', 5, 'Blanc', 17000, 'basic', score=87),
    _v('Hyundai', 'Elantra', 2018, 'LT-0009-B', 'Berline', 'essence', 5, 'Gris', 20000, 'basic', score=85),
    _v('Kia', 'Rio', 2019, 'LT-0010-B', 'Citadine', 'essence', 5, 'Blanc', 17000, 'basic', score=88),
    _v('Kia', 'Picanto', 2021, 'LT-0011-B', 'Citadine', 'essence', 5, 'Jaune', 15000, 'basic', score=93),
    _v('Kia', 'Cerato', 2017, 'CE-0012-B', 'Berline', 'essence', 5, 'Gris', 19000, 'basic', score=83),
    _v('Nissan', 'Almera', 2018, 'LT-0013-B', 'Berline', 'essence', 5, 'Argent', 18000, 'basic', score=84),
    _v('Nissan', 'Micra', 2019, 'LT-0014-B', 'Citadine', 'essence', 5, 'Rouge', 15000, 'basic', score=86),
    _v('Suzuki', 'Swift', 2020, 'LT-0015-B', 'Citadine', 'essence', 5, 'Bleu', 17000, 'basic', score=90),
    _v('Peugeot', '301', 2018, 'LT-0016-B', 'Berline', 'diesel', 5, 'Blanc', 19000, 'basic', score=85),
    _v('Peugeot', '208', 2020, 'LT-0017-B', 'Citadine', 'essence', 5, 'Gris', 20000, 'basic', score=89),
    _v('Renault', 'Logan', 2017, 'LT-0018-B', 'Berline', 'diesel', 5, 'Blanc', 16000, 'basic', score=82),
    _v('Renault', 'Clio', 2019, 'LT-0019-B', 'Citadine', 'essence', 5, 'Rouge', 17000, 'basic', score=86),
    _v('Volkswagen', 'Golf 7', 2017, 'LT-0020-B', 'Citadine', 'essence', 5, 'Noir', 22000, 'basic', score=84),
    _v('Volkswagen', 'Polo', 2019, 'LT-0021-B', 'Citadine', 'essence', 5, 'Blanc', 19000, 'basic', score=88),
    _v('Mazda', '3', 2018, 'LT-0022-B', 'Berline', 'essence', 5, 'Rouge', 21000, 'basic', score=85),
    _v('Ford', 'Fiesta', 2018, 'LT-0023-B', 'Citadine', 'essence', 5, 'Bleu', 17000, 'basic', score=83),
    _v('Dacia', 'Logan', 2019, 'LT-0024-B', 'Berline', 'diesel', 5, 'Blanc', 16000, 'basic', score=87),

    # ── STANDARD — SUV compacts & pickups (25 000 – 55 000 F/jour) ──
    _v('Toyota', 'Corolla', 2022, 'LT-0025-S', 'Berline', 'essence', 5, 'Blanc', 25000, 'standard', score=94),
    _v('Toyota', 'RAV4', 2021, 'LT-0026-S', 'SUV', 'hybrid', 5, 'Gris', 42000, 'standard', 'premium', score=93),
    _v('Toyota', 'Camry', 2021, 'CE-0027-S', 'Berline', 'hybrid', 5, 'Noir', 35000, 'standard', 'premium', score=92),
    _v('Toyota', 'Hilux', 2020, 'LT-0028-S', 'Pickup', 'diesel', 5, 'Blanc', 50000, 'standard', 'premium', score=90),
    _v('Toyota', 'Fortuner', 2019, 'LT-0029-S', 'SUV', 'diesel', 7, 'Argent', 52000, 'standard', 'premium', score=88),
    _v('Toyota', 'Hiace', 2020, 'LT-0030-S', 'Minibus', 'diesel', 14, 'Blanc', 55000, 'standard', score=85),
    _v('Hyundai', 'Tucson', 2023, 'LT-0031-S', 'SUV', 'diesel', 5, 'Gris', 45000, 'standard', 'premium', score=97),
    _v('Hyundai', 'Santa Fe', 2021, 'LT-0032-S', 'SUV', 'diesel', 7, 'Noir', 50000, 'standard', 'premium', score=91),
    _v('Hyundai', 'H-1', 2019, 'LT-0033-S', 'Van', 'diesel', 9, 'Blanc', 45000, 'standard', score=84),
    _v('Kia', 'Sportage', 2023, 'LT-0034-S', 'SUV', 'hybrid', 5, 'Bleu', 38000, 'standard', 'premium', score=95),
    _v('Kia', 'Sorento', 2021, 'LT-0035-S', 'SUV', 'diesel', 7, 'Gris', 48000, 'standard', 'premium', score=90),
    _v('Nissan', 'Qashqai', 2021, 'LT-0036-S', 'SUV', 'essence', 5, 'Rouge', 35000, 'standard', score=89),
    _v('Nissan', 'X-Trail', 2020, 'LT-0037-S', 'SUV', 'diesel', 7, 'Gris', 42000, 'standard', score=86),
    _v('Nissan', 'Navara', 2021, 'LT-0038-S', 'Pickup', 'diesel', 5, 'Blanc', 48000, 'standard', score=88),
    _v('Honda', 'CR-V', 2021, 'LT-0039-S', 'SUV', 'essence', 5, 'Blanc', 40000, 'standard', 'premium', score=91),
    _v('Mazda', 'CX-5', 2022, 'LT-0040-S', 'SUV', 'essence', 5, 'Rouge', 43000, 'standard', 'premium', score=92),
    _v('Mitsubishi', 'Outlander', 2020, 'LT-0041-S', 'SUV', 'essence', 7, 'Gris', 38000, 'standard', score=85),
    _v('Mitsubishi', 'L200', 2021, 'LT-0042-S', 'Pickup', 'diesel', 5, 'Blanc', 46000, 'standard', score=87),
    _v('Mitsubishi', 'Pajero', 2018, 'CE-0043-S', 'SUV', 'diesel', 7, 'Argent', 50000, 'standard', score=83),
    _v('Suzuki', 'Vitara', 2021, 'LT-0044-S', 'SUV', 'essence', 5, 'Vert', 32000, 'standard', score=89),
    _v('Peugeot', '3008', 2021, 'LT-0045-S', 'SUV', 'diesel', 5, 'Gris', 45000, 'standard', 'premium', score=90),
    _v('Peugeot', '508', 2020, 'LT-0046-S', 'Berline', 'diesel', 5, 'Noir', 38000, 'standard', score=87),
    _v('Volkswagen', 'Tiguan', 2021, 'LT-0047-S', 'SUV', 'diesel', 5, 'Blanc', 44000, 'standard', 'premium', score=90),
    _v('Isuzu', 'D-Max', 2022, 'LT-0048-S', 'Pickup', 'diesel', 5, 'Blanc', 47000, 'standard', score=91),
    _v('Ford', 'Ranger', 2021, 'LT-0049-S', 'Pickup', 'diesel', 5, 'Gris', 49000, 'standard', score=89),
    _v('Ford', 'Everest', 2020, 'LT-0050-S', 'SUV', 'diesel', 7, 'Argent', 53000, 'standard', 'premium', score=87),
    _v('Mercedes', 'Sprinter', 2021, 'LT-0051-S', 'Van', 'diesel', 9, 'Blanc', 55000, 'standard', 'premium', score=92),
    _v('Dacia', 'Duster', 2021, 'LT-0052-S', 'SUV', 'diesel', 5, 'Orange', 28000, 'standard', score=88),

    # ── PREMIUM — SUV haut de gamme & berlines premium (55 000 – 90 000 F/jour) ──
    _v('Toyota', 'Land Cruiser Prado', 2022, 'LT-0053-P', 'SUV', 'diesel', 7, 'Blanc', 75000, 'premium', 'all_risk', score=96),
    _v('Toyota', 'Land Cruiser', 2020, 'CE-0054-P', 'SUV', 'diesel', 7, 'Noir', 85000, 'premium', 'all_risk', score=93),
    _v('Toyota', 'Highlander', 2022, 'LT-0055-P', 'SUV', 'hybrid', 7, 'Gris', 68000, 'premium', 'all_risk', score=94),
    _v('Toyota', 'Sienna', 2022, 'LT-0056-P', 'Van', 'hybrid', 8, 'Argent', 65000, 'premium', 'premium', score=95),
    _v('Mercedes', 'Classe C 300', 2022, 'LT-0057-P', 'Berline', 'essence', 5, 'Noir', 70000, 'premium', 'all_risk', score=95),
    _v('Mercedes', 'Classe E 350', 2021, 'LT-0058-P', 'Berline', 'diesel', 5, 'Argent', 78000, 'premium', 'all_risk', score=93),
    _v('Mercedes', 'GLC 300', 2022, 'LT-0059-P', 'SUV', 'essence', 5, 'Blanc', 80000, 'premium', 'all_risk', score=96),
    _v('BMW', 'Serie 5', 2022, 'CE-0060-P', 'Berline', 'essence', 5, 'Noir', 80000, 'premium', 'all_risk', score=99, status='rented'),
    _v('BMW', 'X3', 2021, 'LT-0061-P', 'SUV', 'diesel', 5, 'Blanc', 72000, 'premium', 'all_risk', score=92),
    _v('BMW', 'X5', 2022, 'LT-0062-P', 'SUV', 'diesel', 7, 'Noir', 88000, 'premium', 'all_risk', score=95),
    _v('Audi', 'Q5', 2022, 'LT-0063-P', 'SUV', 'diesel', 5, 'Gris', 75000, 'premium', 'all_risk', score=94),
    _v('Audi', 'A6', 2021, 'LT-0064-P', 'Berline', 'diesel', 5, 'Noir', 70000, 'premium', 'all_risk', score=91),
    _v('Lexus', 'RX 350', 2021, 'LT-0065-P', 'SUV', 'hybrid', 5, 'Blanc', 78000, 'premium', 'all_risk', score=94),
    _v('Lexus', 'GX 460', 2020, 'LT-0066-P', 'SUV', 'essence', 7, 'Noir', 82000, 'premium', 'all_risk', score=90),
    _v('Nissan', 'Patrol', 2020, 'CE-0067-P', 'SUV', 'essence', 7, 'Noir', 85000, 'premium', 'all_risk', score=89),
    _v('Volkswagen', 'Touareg', 2021, 'LT-0068-P', 'SUV', 'diesel', 5, 'Gris', 76000, 'premium', 'all_risk', score=92),

    # ── GOLD — luxe & prestige (> 90 000 F/jour) ──
    _v('Mercedes', 'GLE 350', 2023, 'CE-0069-G', 'SUV', 'diesel', 7, 'Blanc', 95000, 'gold', 'all_risk', score=97),
    _v('Mercedes', 'GLS 450', 2022, 'LT-0070-G', 'SUV', 'essence', 7, 'Noir', 120000, 'gold', 'all_risk', score=95),
    _v('Mercedes', 'Classe S 500', 2023, 'LT-0071-G', 'Berline', 'hybrid', 5, 'Noir', 150000, 'gold', 'all_risk', score=98),
    _v('Mercedes', 'Classe G 63', 2022, 'LT-0072-G', 'SUV', 'essence', 5, 'Vert', 200000, 'gold', 'all_risk', score=96),
    _v('BMW', 'X7', 2023, 'LT-0073-G', 'SUV', 'essence', 7, 'Noir', 130000, 'gold', 'all_risk', score=96),
    _v('BMW', 'Serie 7', 2022, 'LT-0074-G', 'Berline', 'hybrid', 5, 'Gris', 125000, 'gold', 'all_risk', score=94),
    _v('Lexus', 'LX 570', 2021, 'CE-0075-G', 'SUV', 'essence', 7, 'Blanc', 110000, 'gold', 'all_risk', score=93),
    _v('Range Rover', 'Evoque', 2022, 'LT-0076-G', 'SUV', 'essence', 5, 'Vert', 110000, 'gold', 'all_risk', score=98),
    _v('Range Rover', 'Sport', 2023, 'LT-0077-G', 'SUV', 'diesel', 5, 'Noir', 140000, 'gold', 'all_risk', score=97),
    _v('Range Rover', 'Velar', 2022, 'LT-0078-G', 'SUV', 'essence', 5, 'Gris', 105000, 'gold', 'all_risk', score=95),
    _v('Toyota', 'Land Cruiser V8 VXR', 2023, 'LT-0079-G', 'SUV', 'diesel', 7, 'Blanc', 100000, 'gold', 'all_risk', score=98),
    _v('Porsche', 'Cayenne', 2022, 'LT-0080-G', 'SUV', 'essence', 5, 'Noir', 160000, 'gold', 'all_risk', score=97),
    _v('Audi', 'Q7', 2022, 'LT-0081-G', 'SUV', 'diesel', 7, 'Noir', 98000, 'gold', 'all_risk', score=94),
    _v('Audi', 'Q8', 2023, 'LT-0082-G', 'SUV', 'essence', 5, 'Gris', 135000, 'gold', 'all_risk', score=96),
]


class Command(BaseCommand):
    help = 'Seed demo users + vehicles + bookings (idempotent)'

    def handle(self, *args, **options):
        users = {}
        for u in DEMO_USERS:
            obj, created = User.objects.get_or_create(username=u['username'], defaults=u)
            if created:
                obj.set_password('pass123')
                obj.save()
            users[u['username']] = obj
        self.stdout.write(f'Users: {len(users)} ready')

        owner = users['owner']
        for v in DEMO_VEHICLES:
            Vehicle.objects.get_or_create(
                plate=v['plate'],
                defaults={**v, 'owner': owner, 'insurance_expiry': timezone.now().date() + timedelta(days=365)},
            )
        self.stdout.write(f'Vehicles: {Vehicle.objects.count()} ready')

        if not Booking.objects.exists():
            client = users['client']
            driver = users['driver']
            vehicles = list(Vehicle.objects.all()[:3])
            today = timezone.now().date()
            samples = [
                dict(vehicle=vehicles[0], start=today - timedelta(days=6), end=today - timedelta(days=5), status='completed', pickup='Bonanjo, Douala'),
                dict(vehicle=vehicles[1], start=today - timedelta(days=2), end=today - timedelta(days=1), status='completed', pickup='Akwa, Douala'),
                dict(vehicle=vehicles[2], start=today + timedelta(days=1), end=today + timedelta(days=2), status='pending',   pickup='Aeroport DLA'),
            ]
            for s in samples:
                Booking.objects.create(
                    client=client, driver=driver, vehicle=s['vehicle'],
                    start_date=s['start'], end_date=s['end'], status=s['status'],
                    pickup_address=s['pickup'], daily_rate=s['vehicle'].computed_rate or s['vehicle'].daily_rate, days=1,
                )
            self.stdout.write('Bookings: 3 seeded')

        self.stdout.write(self.style.SUCCESS('Seed demo termine'))
