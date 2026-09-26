from datetime import date, timedelta
from rest_framework.test import APITestCase
from apps.users.models import User
from .models import Vehicle


def make_user(username, role='CLIENT'):
    return User.objects.create_user(
        username=username, email=f'{username}@test.cm', password='x', role=role)


def make_vehicle(owner, plate='LT-001-AA', brand='Toyota', model='Corolla',
                 year=2019, status='approved', daily_rate=25000,
                 market_value=15_000_000, mileage=60000, **extra):
    data = dict(
        owner=owner, brand=brand, model=model, year=year, plate=plate,
        category='Berline', fuel='essence', seats=5, color='Blanc',
        mode='home', status=status, daily_rate=daily_rate,
        insurance_type='standard', insurance_expiry=date.today() + timedelta(days=300),
        market_value=market_value, mileage=mileage, condition_score=80, city='Douala',
    )
    data.update(extra)
    return Vehicle.objects.create(**data)


class VehicleCatalogueTests(APITestCase):
    def setUp(self):
        self.owner = make_user('owner', 'OWNER')
        self.client_user = make_user('cli', 'CLIENT')
        self.approved = make_vehicle(self.owner, 'LT-100-AA')
        self.pending = make_vehicle(self.owner, 'LT-200-BB', status='pending')

    def test_public_catalogue_only_approved(self):
        r = self.client.get('/api/vehicles/')
        self.assertEqual(r.status_code, 200)
        plates = {v['plate'] for v in (r.data.get('results') or r.data)}
        self.assertIn('LT-100-AA', plates)
        self.assertNotIn('LT-200-BB', plates)

    def test_owner_management_requires_mine_param(self):
        """Le propriétaire gère ses véhicules via ?mine=1 et peut aussi
        parcourir le catalogue public comme un client."""
        self.client.force_authenticate(self.owner)
        catalogue = self.client.get('/api/vehicles/')
        plates = {v['plate'] for v in (catalogue.data.get('results') or catalogue.data)}
        self.assertNotIn('LT-200-BB', plates)  # pending non visible publiquement
        mine = self.client.get('/api/vehicles/?mine=1')
        plates = {v['plate'] for v in (mine.data.get('results') or mine.data)}
        self.assertIn('LT-200-BB', plates)

    def test_create_vehicle_goes_pending(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post('/api/vehicles/', {
            'brand': 'Toyota', 'model': 'RAV4', 'year': 2020,
            'plate': 'LT-300-CC', 'category': 'SUV', 'fuel': 'essence',
            'seats': 5, 'color': 'Noir', 'mode': 'home', 'daily_rate': 45000,
            'insurance_type': 'all_risk',
            'insurance_expiry': str(date.today() + timedelta(days=300)),
            'market_value': 28_000_000, 'mileage': 40000, 'condition_score': 85,
            'city': 'Douala',
        }, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data['status'], 'pending')

    def test_create_vehicle_requires_auth(self):
        r = self.client.post('/api/vehicles/', {'brand': 'X'}, format='json')
        self.assertIn(r.status_code, (401, 403))


class TierClassificationTests(APITestCase):
    """Classification objective : la catégorie est recalculée au save()."""

    def setUp(self):
        self.owner = make_user('owner', 'OWNER')

    def test_prestige_brand_is_collection(self):
        v = make_vehicle(self.owner, 'LT-500-EE', brand='Porsche',
                         model='Cayenne', year=2023, market_value=120_000_000,
                         mileage=5000, condition_score=95)
        self.assertEqual(v.tier, 'collection')

    def test_old_economy_is_basic(self):
        v = make_vehicle(self.owner, 'LT-600-FF', brand='Toyota', model='Corolla',
                         year=2008, market_value=4_000_000, mileage=260000,
                         condition_score=40)
        self.assertEqual(v.tier, 'basic')

    def test_price_clamped_within_margin(self):
        """Le prix demandé ne peut pas dépasser ±20 % de l'indicatif calculé."""
        v = make_vehicle(self.owner, 'LT-700-GG', daily_rate=10_000_000)
        self.assertLessEqual(float(v.daily_rate), float(v.computed_rate) * 1.20 + 1)
        self.assertGreaterEqual(float(v.daily_rate), float(v.computed_rate) * 0.80 - 1)

    def test_computed_rate_minimum_floor(self):
        v = make_vehicle(self.owner, 'LT-800-HH', daily_rate=1,
                         market_value=1_000_000, year=2005, mileage=400000,
                         condition_score=10)
        self.assertGreaterEqual(float(v.computed_rate), 8000)
