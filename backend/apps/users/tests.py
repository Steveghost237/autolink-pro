from rest_framework.test import APITestCase
from apps.users.models import User


class AuthTests(APITestCase):
    """Inscription / connexion / permissions."""

    def _register(self, email='nouveau@test.cm', password='SecurePass2026!', **extra):
        data = {
            'username': email.split('@')[0], 'email': email,
            'password': password, 'password2': password,
            'first_name': 'Test', 'last_name': 'User',
            'phone': '+237690000001', 'role': 'CLIENT',
        }
        data.update(extra)
        return self.client.post('/api/users/register/', data, format='json')

    def test_register_returns_tokens(self):
        r = self._register()
        self.assertEqual(r.status_code, 201, r.data)
        self.assertIn('access', r.data)
        self.assertEqual(r.data['user']['email'], 'nouveau@test.cm')
        self.assertEqual(r.data['user']['role'], 'CLIENT')

    def test_register_rejects_password_mismatch(self):
        r = self._register(password='AAAaaa111!', password2='BBBbbb222!')
        self.assertEqual(r.status_code, 400)

    def test_register_rejects_duplicate_email(self):
        self._register()
        r = self._register(username='autre')
        self.assertEqual(r.status_code, 400)

    def test_login_ok_and_bad_password(self):
        self._register()
        ok = self.client.post('/api/users/login/', {
            'email': 'nouveau@test.cm', 'password': 'SecurePass2026!'}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertIn('access', ok.data)
        bad = self.client.post('/api/users/login/', {
            'email': 'nouveau@test.cm', 'password': 'mauvais'}, format='json')
        self.assertIn(bad.status_code, (400, 401))

    def test_me_requires_auth(self):
        anon = self.client.get('/api/users/me/')
        self.assertIn(anon.status_code, (401, 403))
        self._register()
        tok = self.client.post('/api/users/login/', {
            'email': 'nouveau@test.cm', 'password': 'SecurePass2026!'},
            format='json').data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tok}')
        r = self.client.get('/api/users/me/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['email'], 'nouveau@test.cm')

    def test_user_list_admin_only(self):
        client = User.objects.create_user(username='c', email='c@c.cm', password='x', role='CLIENT')
        admin = User.objects.create_user(username='a', email='a@a.cm', password='x', role='ADMIN')
        self.client.force_authenticate(client)
        self.assertIn(self.client.get('/api/users/').status_code, (401, 403))
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.get('/api/users/').status_code, 200)


class NotificationTests(APITestCase):
    def test_notifications_scoped_to_user(self):
        u1 = User.objects.create_user(username='u1', email='u1@x.cm', password='x')
        u2 = User.objects.create_user(username='u2', email='u2@x.cm', password='x')
        u1.notifications.create(title='t', message='m')
        self.client.force_authenticate(u2)
        r = self.client.get('/api/users/notifications/')
        data = r.data.get('results', r.data) if isinstance(r.data, dict) else r.data
        self.assertEqual(len(data), 0)
