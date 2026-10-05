import random
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Notification, LoginCode, Message, PlatformSettings
from .serializers import (UserSerializer, RegisterSerializer, LoginSerializer, AdminUserSerializer,
                          AdminUserCreateSerializer, GoogleAuthSerializer, NotificationSerializer,
                          MessageSerializer, MiniUserSerializer, PlatformSettingsSerializer)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class GoogleAuthView(APIView):
    """Connexion / inscription via Google — crée le compte si nécessaire."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── Connexion par code email (OTP) ───────────────────────────────────────────

def _otp_email_html(code, first_name):
    """Email HTML stylé avec le code de connexion à 6 chiffres."""
    digits = ''.join(
        f'<td style="width:44px;height:52px;background:#0B2447;color:#fff;'
        f'font-size:26px;font-weight:800;text-align:center;border-radius:10px;'
        f'font-family:Arial,sans-serif">{d}</td>'
        + ('<td style="width:8px"></td>' if i < 5 else '')
        for i, d in enumerate(code))
    return f"""
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;
  background:#F8FAFC;padding:32px 20px;border-radius:16px">
  <div style="text-align:center;margin-bottom:24px">
    <span style="font-size:24px;font-weight:900;color:#0B2447">Auto<span style="color:#2563EB">Link</span>
      <span style="color:#D97706;font-size:13px">PRO</span></span>
  </div>
  <div style="background:#fff;border-radius:14px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <h2 style="margin:0 0 8px;color:#0F172A;font-size:18px">Bonjour {first_name or ''},</h2>
    <p style="color:#475569;font-size:14px;margin:0 0 20px">
      Voici votre code de connexion AutoLink Pro. Il est valable <strong>10 minutes</strong>.
    </p>
    <table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>{digits}</tr></table>
    <p style="color:#94A3B8;font-size:12px;margin:0;text-align:center">
      Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
    </p>
  </div>
  <p style="text-align:center;color:#94A3B8;font-size:11px;margin-top:20px">
    AutoLink Pro — Location de véhicules au Cameroun
  </p>
</div>"""


class OTPRequestView(APIView):
    """Envoie un code à 6 chiffres par email (connexion sans mot de passe)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        first_name = (request.data.get('first_name') or '').strip()
        last_name = (request.data.get('last_name') or '').strip()
        if not email or '@' not in email:
            return Response({'email': 'Adresse email invalide.'}, status=400)

        # Anti-spam : un code par minute et par email
        recent = LoginCode.objects.filter(
            email=email, created_at__gte=timezone.now() - timedelta(minutes=1)).first()
        if recent:
            return Response({'detail': 'Un code vient déjà d\'être envoyé. Patientez une minute.'}, status=429)

        code = f'{random.SystemRandom().randint(0, 999999):06d}'
        LoginCode.objects.filter(email=email).delete()
        LoginCode.objects.create(
            email=email, code=code, first_name=first_name, last_name=last_name,
            expires_at=timezone.now() + timedelta(minutes=10))
        send_mail(
            subject=f'AutoLink Pro — Votre code de connexion : {code}',
            message=f'Votre code de connexion AutoLink Pro : {code} (valable 10 minutes).',
            from_email=None,  # DEFAULT_FROM_EMAIL
            recipient_list=[email],
            html_message=_otp_email_html(code, first_name),
            fail_silently=False,
        )
        return Response({'detail': 'Code envoyé.', 'email': email})


class OTPVerifyView(APIView):
    """Vérifie le code email et retourne les tokens JWT (compte créé si besoin)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        code = (request.data.get('code') or '').strip()
        otp = LoginCode.objects.filter(email=email).first()
        if not otp or otp.expires_at < timezone.now():
            return Response({'detail': 'Code expiré — demandez-en un nouveau.'}, status=400)
        if otp.attempts >= 5:
            otp.delete()
            return Response({'detail': 'Trop de tentatives — demandez un nouveau code.'}, status=429)
        if otp.code != code:
            otp.attempts += 1
            otp.save(update_fields=['attempts'])
            return Response({'detail': 'Code incorrect.'}, status=400)

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            base = email.split('@')[0]
            username = base
            i = 1
            while User.objects.filter(username=username).exists():
                i += 1
                username = f'{base}{i}'
            user = User.objects.create_user(
                username=username, email=email,
                first_name=otp.first_name, last_name=otp.last_name,
                role='CLIENT', is_verified=True)
            user.set_unusable_password()
            user.save()
        if not user.is_active:
            return Response({'detail': 'Ce compte a été suspendu.'}, status=403)
        otp.delete()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('-created_at')
    permission_classes = [IsAdminRole]
    filterset_fields = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'referral_code']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return AdminUserSerializer


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Admin peut activer/désactiver/vérifier/modifier n'importe quel compte."""
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]


class NotificationListView(generics.ListAPIView):
    """Notifications de l'utilisateur connecté — les plus récentes d'abord."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()[:100]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        unread = request.user.notifications.filter(is_read=False).count()
        return Response({'unread': unread, 'results': self.get_serializer(qs, many=True).data})


class NotificationReadView(APIView):
    """Marque toutes les notifications (ou une seule) comme lues."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        qs = request.user.notifications.filter(is_read=False)
        if pk:
            qs = qs.filter(pk=pk)
        qs.update(is_read=True)
        return Response({'unread': request.user.notifications.filter(is_read=False).count()})


# ─── Messagerie interne (client ↔ propriétaire ↔ support) ────────────────────

def _my_messages(user):
    """Tous les messages visibles par l'utilisateur.
    recipient=None = message pour le support → visible par les admins."""
    qs = Message.objects.select_related('sender', 'recipient')
    if user.role == 'ADMIN':
        return qs.filter(Q(sender=user) | Q(recipient=user) | Q(recipient__isnull=True))
    return qs.filter(Q(sender=user) | Q(recipient=user))


def _contact_ids(user):
    """Utilisateurs avec qui user peut discuter (hors support)."""
    if user.role == 'ADMIN':
        return User.objects.exclude(pk=user.pk).values_list('id', flat=True)
    if user.role == 'OWNER':
        return User.objects.filter(bookings__vehicle__owner=user).values_list('id', flat=True).distinct()
    if user.role == 'INTERMEDIARY':
        return User.objects.filter(bookings__intermediary=user).values_list('id', flat=True).distinct()
    # CLIENT / autres : propriétaires des véhicules réservés
    return User.objects.filter(vehicles__bookings__client=user).values_list('id', flat=True).distinct()


class MessageListView(generics.ListCreateAPIView):
    """GET : conversation filtrée par ?peer=<user_id> ou ?peer=support.
    POST : envoie un message (recipient vide = équipe support)."""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = _my_messages(u)
        peer = self.request.query_params.get('peer')
        if peer == 'support' and u.role != 'ADMIN':
            qs = qs.filter(Q(sender=u, recipient__isnull=True)
                           | Q(sender=u, recipient__role='ADMIN')
                           | Q(recipient=u, sender__role='ADMIN'))
        elif peer and str(peer).isdigit():
            p = int(peer)
            if u.role == 'ADMIN':
                qs = qs.filter(Q(sender=u, recipient_id=p)
                               | Q(recipient=u, sender_id=p)
                               | Q(sender_id=p, recipient__isnull=True))
            else:
                qs = qs.filter(Q(sender=u, recipient_id=p) | Q(recipient=u, sender_id=p))
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        recipient_id = self.request.data.get('recipient')
        if recipient_id:
            allowed = set(_contact_ids(u)) | set(
                User.objects.filter(role='ADMIN', is_active=True).values_list('id', flat=True))
            if u.role != 'ADMIN' and int(recipient_id) not in allowed:
                raise PermissionDenied('Vous ne pouvez écrire qu\'à vos contacts ou au support.')
            recipient = User.objects.filter(pk=recipient_id, is_active=True).first()
            if recipient is None:
                raise ValidationError({'recipient': 'Destinataire introuvable.'})
            serializer.save(sender=u, recipient=recipient)
        else:
            serializer.save(sender=u, recipient=None)


class MessageThreadsView(APIView):
    """Liste des conversations : {key, peer_id, peer_name, peer_role,
    last_body, last_at, unread}."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        threads = {}
        for m in _my_messages(u):
            other = m.recipient if m.sender_id == u.id else m.sender
            if u.role != 'ADMIN' and (other is None or other.role == 'ADMIN'):
                key, peer_id, name, role = 'support', 'support', 'Support AutoLink', 'ADMIN'
            else:
                key = f'user-{other.id}'
                peer_id, name, role = other.id, other.get_full_name() or other.email, other.role
            t = threads.setdefault(key, {
                'key': key, 'peer_id': peer_id, 'peer_name': name, 'peer_role': role,
                'last_body': '', 'last_at': None, 'unread': 0})
            t['last_body'] = m.body
            t['last_at'] = m.created_at
            incoming = (m.recipient_id == u.id) or (u.role == 'ADMIN' and m.sender_id != u.id and m.recipient_id is None)
            if incoming and not m.is_read:
                t['unread'] += 1
        data = sorted(threads.values(), key=lambda t: t['last_at'] or '', reverse=True)
        return Response({'results': data})


class MessageContactsView(APIView):
    """Contacts avec qui démarrer une conversation (+ support pour non-admins)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        users = User.objects.filter(pk__in=_contact_ids(u), is_active=True).order_by('first_name')[:100]
        return Response({'results': MiniUserSerializer(users, many=True).data})


class MessageReadView(APIView):
    """Marque comme lus tous les messages reçus d'un interlocuteur."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        u = request.user
        peer = request.query_params.get('peer')
        qs = Message.objects.filter(is_read=False)
        if u.role == 'ADMIN':
            if not (peer and str(peer).isdigit()):
                return Response({'detail': 'peer requis.'}, status=400)
            qs = qs.filter(sender_id=int(peer)).filter(Q(recipient=u) | Q(recipient__isnull=True))
        elif peer == 'support':
            qs = qs.filter(recipient=u, sender__role='ADMIN')
        elif peer and str(peer).isdigit():
            qs = qs.filter(recipient=u, sender_id=int(peer))
        else:
            return Response({'detail': 'peer requis.'}, status=400)
        qs.update(is_read=True)
        return Response({'ok': True})


# ─── Paramètres de la plateforme ─────────────────────────────────────────────

class PlatformSettingsView(generics.RetrieveUpdateAPIView):
    """GET/PATCH des paramètres globaux — réservé à l'admin."""
    serializer_class = PlatformSettingsSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return PlatformSettings.load()

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class PublicConfigView(APIView):
    """Configuration publique (tarif service chauffeur, contacts support)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        s = PlatformSettings.load()
        return Response({
            'driver_service_price': s.driver_service_price,
            'support_email': s.support_email,
            'support_phone': s.support_phone,
        })
