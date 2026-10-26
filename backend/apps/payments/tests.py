import hmac, hashlib, json, time
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch
from django.test import override_settings
from rest_framework.test import APITestCase
from apps.users.models import User
from apps.vehicles.tests import make_user, make_vehicle
from apps.bookings.models import Booking
from .models import Payment, WalletTransaction


class WalletTopupTests(APITestCase):
    def setUp(self):
        self.user = make_user('u1', 'CLIENT')
        self.client.force_authenticate(self.user)

    @override_settings(MTN_MOMO_SUBSCRIPTION_KEY='', MTN_MOMO_API_USER='', MTN_MOMO_API_KEY='')
    def test_unconfigured_mtn_topup_returns_503(self):
        r = self.client.post('/api/payments/wallet/topup/',
                             {'amount': 50000, 'method': 'mtn', 'phone': '237690000000'},
                             format='json')
        self.assertEqual(r.status_code, 503, r.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('0'))

    @override_settings(MTN_MOMO_SUBSCRIPTION_KEY='sub', MTN_MOMO_API_USER='user', MTN_MOMO_API_KEY='key')
    @patch('apps.payments.views.providers.mtn_status')
    @patch('apps.payments.views.providers.mtn_request_to_pay')
    def test_mtn_success_credits_once_when_polled_twice(self, mock_request, mock_status):
        mock_request.return_value = {'provider_ref': 'provider-1', 'status': 'PENDING'}
        mock_status.return_value = {'status': 'SUCCESSFUL'}
        response = self.client.post('/api/payments/wallet/topup/',
            {'amount': 10000, 'method': 'mtn', 'phone': '237690000000'}, format='json')
        self.assertEqual(response.status_code, 202, response.data)
        ref = response.data['reference']
        self.client.get(f'/api/payments/wallet/transactions/{ref}/status/')
        self.client.get(f'/api/payments/wallet/transactions/{ref}/status/')
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('10000'))

    @override_settings(MTN_MOMO_SUBSCRIPTION_KEY='sub', MTN_MOMO_API_USER='user', MTN_MOMO_API_KEY='key')
    @patch('apps.payments.views.providers.mtn_status', return_value={'status': 'FAILED'})
    @patch('apps.payments.views.providers.mtn_request_to_pay', return_value={'provider_ref': 'provider-2', 'status': 'PENDING'})
    def test_mtn_failed_does_not_credit(self, *_):
        response = self.client.post('/api/payments/wallet/topup/',
            {'amount': 10000, 'method': 'mtn', 'phone': '237690000000'}, format='json')
        self.client.get(f"/api/payments/wallet/transactions/{response.data['reference']}/status/")
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('0'))

    def test_orange_notification_bad_token_is_forbidden(self):
        WalletTransaction.objects.create(
            user=self.user, kind='topup', method='orange', amount=10000, balance_after=0,
            reference='TOP-ORANGE', status='pending', provider_ref='ORANGE-1', provider_token='valid')
        response = self.client.post('/api/payments/orange-notification/',
            {'order_id': 'ORANGE-1', 'notif_token': 'invalid'}, format='json')
        self.assertEqual(response.status_code, 403)

    @patch('apps.payments.views.providers.orange_status', return_value={'status': 'SUCCESSFUL'})
    def test_orange_success_notification_credits_wallet(self, _):
        WalletTransaction.objects.create(
            user=self.user, kind='topup', method='orange', amount=10000, balance_after=0,
            reference='TOP-ORANGE', status='pending', provider_ref='ORANGE-1',
            provider_token='valid', provider_pay_token='pay-token')
        response = self.client.post('/api/payments/orange-notification/',
            {'order_id': 'ORANGE-1', 'notif_token': 'valid'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('10000'))

    @override_settings(MTN_MOMO_SUBSCRIPTION_KEY='sub', MTN_MOMO_API_USER='user', MTN_MOMO_API_KEY='key',
                       ORANGE_CLIENT_ID='id', ORANGE_CLIENT_SECRET='secret', ORANGE_MERCHANT_KEY='merchant')
    def test_methods_endpoint_reflects_configuration(self):
        response = self.client.get('/api/payments/methods/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['methods'], ['mtn', 'orange'])

    @patch('apps.payments.views.providers.paypal_create_order')
    def test_paypal_topup_stays_pending(self, mock_create):
        mock_create.return_value = {'id': 'ORDER123', 'approval_url': 'https://paypal.com/x'}
        r = self.client.post('/api/payments/wallet/topup/',
                             {'amount': 20000, 'method': 'paypal'}, format='json')
        self.assertEqual(r.status_code, 202, r.data)
        self.assertIn('payment_url', r.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, 0)  # pas crédité avant vérification
        tx = WalletTransaction.objects.get(provider_ref='ORDER123')
        self.assertEqual(tx.status, 'pending')

    @override_settings(STRIPE_API_KEY='')
    def test_stripe_without_key_fails_cleanly(self):
        r = self.client.post('/api/payments/wallet/topup/',
                             {'amount': 10000, 'method': 'stripe'}, format='json')
        self.assertEqual(r.status_code, 502)
        tx = WalletTransaction.objects.latest('id')
        self.assertEqual(tx.status, 'failed')

    def test_topup_requires_auth(self):
        self.client.force_authenticate(user=None)
        r = self.client.post('/api/payments/wallet/topup/', {'amount': 1, 'method': 'mtn'}, format='json')
        self.assertIn(r.status_code, (401, 403))


class PaymentMethodConfigurationTests(APITestCase):
    @override_settings(
        STRIPE_API_KEY='sk_test',
        PAYPAL_CLIENT_ID='paypal-client',
        PAYPAL_CLIENT_SECRET='paypal-secret',
    )
    def test_methods_use_provider_configuration(self):
        response = self.client.get('/api/payments/methods/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['methods'], ['stripe', 'paypal'])
        self.assertEqual(response.data['booking_methods'], ['wallet', 'stripe', 'paypal'])


class ProviderStatusPollingTests(APITestCase):
    def setUp(self):
        self.user = make_user('payment-client', 'CLIENT')
        self.client.force_authenticate(self.user)

    @patch('apps.payments.views.providers.orange_status')
    @patch('apps.payments.views.providers.mtn_status')
    def test_wallet_status_does_not_poll_non_mobile_methods(self, mtn_status, orange_status):
        tx = WalletTransaction.objects.create(
            user=self.user, kind='topup', method='stripe', amount=10000,
            balance_after=0, reference='TOP-STRIPE-PENDING', status='pending',
            provider_ref='cs_pending',
        )

        response = self.client.get(f'/api/payments/wallet/transactions/{tx.reference}/status/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'pending')
        mtn_status.assert_not_called()
        orange_status.assert_not_called()

    @patch('apps.payments.views.providers.orange_status')
    @patch('apps.payments.views.providers.mtn_status')
    def test_booking_status_does_not_poll_non_mobile_methods(self, mtn_status, orange_status):
        owner = make_user('payment-owner', 'OWNER')
        vehicle = make_vehicle(owner, 'LT-955-PP')
        booking = Booking.objects.create(
            client=self.user, vehicle=vehicle,
            start_date=date.today() + timedelta(days=30),
            end_date=date.today() + timedelta(days=31),
            daily_rate=Decimal('25000'), days=1, subtotal=Decimal('25000'),
            commission_amount=Decimal('12500'), owner_amount=Decimal('12500'),
        )
        Payment.objects.create(
            booking=booking, payer=self.user, method='paypal', status='pending',
            amount=Decimal('25000'), commission=Decimal('12500'),
            owner_payout=Decimal('12500'), provider_ref='paypal-pending',
        )

        response = self.client.get(f'/api/payments/bookings/{booking.pk}/status/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'pending')
        mtn_status.assert_not_called()
        orange_status.assert_not_called()


class ExternalReturnTests(APITestCase):
    """Retours Stripe/PayPal : crédit uniquement après vérification provider."""

    def setUp(self):
        self.user = make_user('u1', 'CLIENT')
        self.tx = WalletTransaction.objects.create(
            user=self.user, kind='topup', method='stripe', amount=15000,
            balance_after=0, reference='TOP-TEST', status='pending',
            provider_ref='cs_test_123')

    @patch('apps.payments.views.providers.stripe_get_session')
    def test_stripe_return_credits_after_paid(self, mock_session):
        mock_session.return_value = {
            'payment_status': 'paid',
            'metadata': {'autolink_ref': 'TOP-TEST'},
        }
        r = self.client.get('/api/payments/stripe-return/?session_id=cs_test_123')
        self.assertEqual(r.status_code, 302)
        self.assertIn('topup=success', r['Location'])
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('15000'))

    @patch('apps.payments.views.providers.stripe_get_session')
    def test_stripe_return_unpaid_does_not_credit(self, mock_session):
        mock_session.return_value = {'payment_status': 'unpaid', 'metadata': {}}
        r = self.client.get('/api/payments/stripe-return/?session_id=cs_test_123')
        self.assertIn('pending', r['Location'])
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, 0)

    def test_stripe_return_canceled(self):
        r = self.client.get('/api/payments/stripe-return/?canceled=1')
        self.assertIn('canceled', r['Location'])

    def test_credit_wallet_tx_idempotent(self):
        from apps.payments.views import _credit_wallet_tx
        self.assertTrue(_credit_wallet_tx(self.tx))
        self.assertFalse(_credit_wallet_tx(self.tx))  # 2e appel = pas de double crédit
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('15000'))


class StripeWebhookTests(APITestCase):
    def setUp(self):
        self.user = make_user('u1', 'CLIENT')
        self.tx = WalletTransaction.objects.create(
            user=self.user, kind='topup', method='stripe', amount=30000,
            balance_after=0, reference='TOP-WH', status='pending',
            provider_ref='cs_wh_1')
        self.event = {
            'type': 'checkout.session.completed',
            'data': {'object': {'id': 'cs_wh_1', 'metadata': {'autolink_ref': 'TOP-WH'}}},
        }

    @override_settings(STRIPE_WEBHOOK_SECRET='whsec_test')
    def test_webhook_valid_signature_credits(self):
        payload = json.dumps(self.event).encode()
        ts = int(time.time())
        sig = hmac.new(b'whsec_test', f'{ts}.'.encode() + payload, hashlib.sha256).hexdigest()
        r = self.client.post('/api/payments/stripe-webhook/', data=payload,
                             content_type='application/json',
                             HTTP_STRIPE_SIGNATURE=f't={ts},v1={sig}')
        self.assertEqual(r.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('30000'))

    @override_settings(STRIPE_WEBHOOK_SECRET='whsec_test')
    def test_webhook_bad_signature_rejected(self):
        r = self.client.post('/api/payments/stripe-webhook/',
                             data=json.dumps(self.event).encode(),
                             content_type='application/json',
                             HTTP_STRIPE_SIGNATURE='t=1,v1=faux')
        self.assertEqual(r.status_code, 400)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, 0)

    @override_settings(STRIPE_WEBHOOK_SECRET='whsec_test')
    def test_webhook_replay_rejected(self):
        payload = json.dumps(self.event).encode()
        old_ts = int(time.time()) - 400  # > 5 min
        sig = hmac.new(b'whsec_test', f'{old_ts}.'.encode() + payload, hashlib.sha256).hexdigest()
        r = self.client.post('/api/payments/stripe-webhook/', data=payload,
                             content_type='application/json',
                             HTTP_STRIPE_SIGNATURE=f't={old_ts},v1={sig}')
        self.assertEqual(r.status_code, 400)


class BookingExternalPaymentTests(APITestCase):
    def setUp(self):
        self.owner = make_user('owner', 'OWNER')
        self.client_user = make_user('cli', 'CLIENT')
        self.vehicle = make_vehicle(self.owner, 'LT-950-JJ', daily_rate=25000)
        self.start = date.today() + timedelta(days=40)
        self.client.force_authenticate(self.client_user)

    @patch('apps.payments.providers.paypal_create_order')
    def test_paypal_booking_pending_until_capture(self, mock_create):
        mock_create.return_value = {'id': 'PAYORDER9', 'approval_url': 'https://paypal.com/pay'}
        r = self.client.post('/api/bookings/', {
            'vehicle': self.vehicle.id, 'start_date': str(self.start),
            'end_date': str(self.start + timedelta(days=2)),
            'driver_type': 'none', 'payment_method': 'paypal'}, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertIn('payment_url', r.data)
        booking = Booking.objects.get(pk=r.data['id'])
        self.assertEqual(booking.status, 'pending')  # pas de fausse confirmation
        self.assertEqual(booking.payment.status, 'pending')

        # Simulation du retour PayPal vérifié
        with patch('apps.payments.views.providers.paypal_capture_order') as mock_cap:
            mock_cap.return_value = {'status': 'COMPLETED'}
            resp = self.client.get(f'/api/payments/paypal-return/?token=PAYORDER9&ctx=booking')
            self.assertIn('payment=success', resp['Location'])
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'confirmed')
        self.assertEqual(booking.payment.status, 'completed')
