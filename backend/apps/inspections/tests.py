from datetime import date, timedelta
from decimal import Decimal
from rest_framework.test import APITestCase
from apps.bookings.models import Booking
from apps.users.models import User
from apps.vehicles.tests import make_vehicle


class InspectionWorkflowTests(APITestCase):
    def setUp(self):
        self.controller = User.objects.create_user(
            username='inspection-controller', email='controller@test.cm',
            password='x', role='CONTROLLER')
        self.owner = User.objects.create_user(
            username='inspection-owner', email='owner@test.cm', password='x', role='OWNER')
        self.client_user = User.objects.create_user(
            username='inspection-client', email='client@test.cm', password='x', role='CLIENT')
        self.vehicle = make_vehicle(self.owner, plate='IN-001-AA')
        self.booking = Booking.objects.create(
            client=self.client_user, vehicle=self.vehicle,
            start_date=date.today(), end_date=date.today() + timedelta(days=2),
            daily_rate=Decimal('20000'), days=2, subtotal=Decimal('40000'),
            commission_amount=Decimal('20000'), owner_amount=Decimal('20000'),
        )
        self.client.force_authenticate(self.controller)

    def test_create_inspection_updates_vehicle_condition_and_last_inspection(self):
        response = self.client.post('/api/inspections/', {
            'booking': self.booking.pk,
            'vehicle': self.vehicle.pk,
            'inspection_type': 'entry',
            'mileage_at_inspection': 71234,
            'fuel_level': 65,
            'condition_score': 88,
            'checklist': {'carrosserie': 'ok'},
            'issues': [],
            'notes': 'RAS',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.condition_score, 88)
        self.assertEqual(self.vehicle.last_inspection_score, 88)
        self.assertIsNotNone(self.vehicle.last_inspection_at)
        self.assertEqual(self.vehicle.mileage, 71234)
        self.assertEqual(self.vehicle.fuel_level, 65)
