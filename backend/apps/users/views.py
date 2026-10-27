import random
import logging
from urllib.parse import urlencode
from django.core import signing
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection, send_mail
from django.db.models import Count, Q
from django.db.models.deletion import ProtectedError
from django.urls import reverse
from django.utils import timezone
from django.utils.html import escape, strip_tags
from datetime import timedelta
from rest_framework import filters, generics, permissions, serializers, status
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from .email_utils import (
    contact_acknowledgement,
    get_request_language,
    get_user_language,
    send_login_notification,
    send_welcome_email,
)
from .models import ContactMessage, Message, NewsletterCampaign, PlatformSettings, User, Notification, LoginCode
from .serializers import (ContactMessageAdminSerializer, ContactMessageSerializer,
                          NewsletterCampaignSerializer, NewsletterSendSerializer,
                          UserSerializer, RegisterSerializer, LoginSerializer, AdminUserSerializer,
                          AdminUserCreateSerializer, GoogleAuthSerializer, NotificationSerializer,
                          MessageSerializer, MiniUserSerializer, PlatformSettingsSerializer)


logger = logging.getLogger(__name__)


class ContactAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contact'

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        body = (
            f"Nom : {message.last_name}\n"
            f"Prénom : {message.first_name}\n"
            f"Téléphone : {message.phone}\n"
            f"Email : {message.email or 'Non renseigné'}\n"
            f"Type de location : {message.rental_type or 'Non précisé'}\n\n"
            f"Message :\n{message.message}"
        )
        try:
            send_mail(
                subject=f'Nouvelle demande de contact — {message.first_name} {message.last_name}',
                message=body,
                from_email=None,
                recipient_list=[settings.CONTACT_EMAIL],
                fail_silently=False,
            )
            if message.email:
                language = (
                    request.user.language
                    if request.user.is_authenticated
                    else get_request_language(request)
                )
                subject, acknowledgement = contact_acknowledgement(
                    message.first_name, language)
                send_mail(
                    subject=subject,
                    message=acknowledgement,
                    from_email=None,
                    recipient_list=[message.email],
                    fail_silently=False,
                )
        except Exception:
            logger.exception('Unable to send a contact message notification')
            return Response(
                {'detail': "Votre message a été enregistré, mais son envoi a échoué. "
                           "Veuillez réessayer ou nous contacter par téléphone."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response({'detail': 'Votre message a bien été envoyé.'},
                        status=status.HTTP_201_CREATED)


class SiteConfigAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'contact_email': settings.CONTACT_EMAIL,
            'phones': ['+237 656 789 000', '+237 699 456 000'],
            'addresses': ['Akwa, Rue Joss, Douala', 'Centre-ville, Yaoundé'],
            'hours': {
                'weekdays': {'open': '06:00', 'close': '22:00'},
                'saturday': {'open': '07:00', 'close': '21:00'},
                'sunday': None,
            },
        })


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class ContactMessageViewSet(ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageAdminSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['last_name', 'first_name', 'phone', 'email', 'rental_type', 'message']
    ordering_fields = ['created_at', 'last_name', 'first_name', 'is_handled']


NEWSLETTER_UNSUBSCRIBE_SALT = 'autolink-newsletter-unsubscribe'


class NewsletterUnsubscribeView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        token = request.query_params.get('token', '')
        try:
            payload = signing.loads(token, salt=NEWSLETTER_UNSUBSCRIBE_SALT)
            user = User.objects.get(pk=payload['user_id'], email=payload['email'])
        except (signing.BadSignature, KeyError, TypeError, ValueError, User.DoesNotExist):
            return Response(
                {'detail': 'Lien de désinscription invalide ou expiré.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.newsletter_opt_in:
            user.newsletter_opt_in = False
            user.save(update_fields=['newsletter_opt_in'])
        return Response({'detail': 'Votre désinscription est prise en compte.'})


class NewsletterCampaignListView(generics.ListCreateAPIView):
    queryset = NewsletterCampaign.objects.select_related('sent_by')
    serializer_class = NewsletterCampaignSerializer
    permission_classes = [IsAdminRole]
    search_fields = ['subject', 'body']
    ordering_fields = ['subject', 'sent_at', 'recipients_count']

    def get_serializer_class(self):
        return NewsletterCampaignSerializer if self.request.method == 'GET' else NewsletterSendSerializer


class NewsletterCampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = NewsletterCampaign.objects.select_related('sent_by')
    serializer_class = NewsletterCampaignSerializer
    permission_classes = [IsAdminRole]


class NewsletterResendView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            campaign = NewsletterCampaign.objects.get(pk=pk)
        except NewsletterCampaign.DoesNotExist:
            return Response({'detail': 'Campagne introuvable.'}, status=404)

        # Extract subject and body from the campaign
        subject = campaign.subject
        html_body = campaign.body if '<' in campaign.body else ''
        text_body = campaign.body if '<' not in campaign.body else ''

        # Send the newsletter
        from .email_utils import get_request_language
        from django.core.mail import EmailMultiAlternatives

        subscribers = User.objects.filter(
            is_active=True,
            newsletter_opt_in=True,
            role__in=['CLIENT', 'OWNER', 'DRIVER']
        )

        sent_count = 0
        for subscriber in subscribers:
            if not subscriber.email:
                continue

            language = get_user_language(subscriber)
            unsubscribe_token = signer.sign(str(subscriber.pk))
            unsubscribe_url = f"{settings.FRONTEND_URL}/newsletter/unsubscribe?token={unsubscribe_token}"

            email = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[subscriber.email],
            )

            if html_body:
                # Add unsubscribe link to HTML
                html_with_unsubscribe = f"{html_body}<br><br><small><a href='{unsubscribe_url}'>Se désinscrire</a></small>"
                email.attach_alternative(html_with_unsubscribe, 'text/html')

            try:
                email.send()
                sent_count += 1
            except Exception:
                continue

        # Update the campaign
        campaign.sent_at = timezone.now()
        campaign.recipients_count = sent_count
        campaign.save(update_fields=['sent_at', 'recipients_count'])

        return Response({
            'detail': 'Campagne renvoyée avec succès.',
            'recipients_count': sent_count,
        })


class NewsletterSendView(APIView):
    permission_classes = [IsAdminRole]
    batch_size = 100

    def post(self, request):
        serializer = NewsletterSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subject = serializer.validated_data['subject']
        html_body = serializer.validated_data['html_body'].strip()
        text_body = serializer.validated_data['text_body'].strip()
        recorded_body = html_body or text_body
        unsubscribe_base = request.build_absolute_uri(reverse('newsletter-unsubscribe'))
        connection = get_connection(fail_silently=True)
        messages = []
        sent_count = 0

        for user in (User.objects
                     .filter(is_active=True, newsletter_opt_in=True)
                     .exclude(email='')
                     .order_by('pk')
                     .iterator(chunk_size=self.batch_size)):
            token = signing.dumps(
                {'user_id': user.pk, 'email': user.email},
                salt=NEWSLETTER_UNSUBSCRIBE_SALT,
            )
            unsubscribe_url = f'{unsubscribe_base}?{urlencode({"token": token})}'
            plain_content = text_body or strip_tags(html_body)
            if get_user_language(user) == 'en':
                plain_content = f'{plain_content}\n\nUnsubscribe: {unsubscribe_url}'
                unsubscribe_label = 'Unsubscribe'
            else:
                plain_content = f'{plain_content}\n\nSe désinscrire : {unsubscribe_url}'
                unsubscribe_label = 'Se désinscrire'
            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
                connection=connection,
            )
            if html_body:
                html_content = (
                    f'{html_body}\n<p><a href="{escape(unsubscribe_url)}">'
                    f'{unsubscribe_label}</a></p>'
                )
                email.attach_alternative(html_content, 'text/html')
            messages.append(email)

            if len(messages) >= self.batch_size:
                sent_count += connection.send_messages(messages)
                messages = []

        if messages:
            sent_count += connection.send_messages(messages)

        campaign = NewsletterCampaign.objects.create(
            subject=subject,
            body=recorded_body,
            sent_at=timezone.now(),
            recipients_count=sent_count,
            sent_by=request.user,
        )
        return Response({
            'campaign': NewsletterCampaignSerializer(campaign).data,
            'recipients_count': sent_count,
        }, status=status.HTTP_201_CREATED)


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
        serializer = GoogleAuthSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(language=get_request_language(request))
        send_welcome_email(user)
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

def _otp_email_html(code, first_name, language='fr'):
    """Email HTML stylé avec le code de connexion à 6 chiffres."""
    if language == 'en':
        greeting = f'Hello {first_name or ""},'
        introduction = (
            'Here is your AutoLink Pro sign-in code. It is valid for '
            '<strong>10 minutes</strong>.'
        )
        ignore = 'If you did not request this code, you can ignore this email.'
        footer = 'Vehicle rental in Cameroon'
    else:
        greeting = f'Bonjour {first_name or ""},'
        introduction = (
            'Voici votre code de connexion AutoLink Pro. Il est valable '
            '<strong>10 minutes</strong>.'
        )
        ignore = "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
        footer = 'Location de véhicules au Cameroun'
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
    <h2 style="margin:0 0 8px;color:#0F172A;font-size:18px">{greeting}</h2>
    <p style="color:#475569;font-size:14px;margin:0 0 20px">
      {introduction}
    </p>
    <table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>{digits}</tr></table>
    <p style="color:#94A3B8;font-size:12px;margin:0;text-align:center">
      {ignore}
    </p>
  </div>
  <p style="text-align:center;color:#94A3B8;font-size:11px;margin-top:20px">
    AutoLink Pro — {footer}
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

        existing_user = User.objects.filter(email__iexact=email).only('language').first()
        language = (
            get_user_language(existing_user)
            if existing_user
            else get_request_language(request)
        )
        code = f'{random.SystemRandom().randint(0, 999999):06d}'
        LoginCode.objects.filter(email=email).delete()
        LoginCode.objects.create(
            email=email, code=code, first_name=first_name, last_name=last_name,
            expires_at=timezone.now() + timedelta(minutes=10))
        subject = (
            f'AutoLink Pro — Your sign-in code: {code}'
            if language == 'en'
            else f'AutoLink Pro — Votre code de connexion : {code}'
        )
        message = (
            f'Your AutoLink Pro sign-in code is {code} (valid for 10 minutes).'
            if language == 'en'
            else f'Votre code de connexion AutoLink Pro : {code} (valable 10 minutes).'
        )
        send_mail(
            subject=subject,
            message=message,
            from_email=None,  # DEFAULT_FROM_EMAIL
            recipient_list=[email],
            html_message=_otp_email_html(code, first_name, language),
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
        created = user is None
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
                role='CLIENT', is_verified=True,
                language=get_request_language(request))
            user.set_unusable_password()
            user.save()
        if not user.is_active:
            return Response({'detail': 'Ce compte a été suspendu.'}, status=403)
        if created:
            send_welcome_email(user)
        send_login_notification(user)
        otp.delete()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class UserListView(generics.ListCreateAPIView):
    permission_classes = [IsAdminRole]
    filterset_fields = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'referral_code']
    ordering_fields = ['created_at', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_verified']

    def get_queryset(self):
        return User.objects.annotate(
            bookings_count=Count('bookings', distinct=True),
            vehicles_count=Count('vehicles', distinct=True),
            trips_count=Count('driven_bookings', distinct=True),
        ).order_by('-created_at')

    def get_serializer_class(self):
        return AdminUserCreateSerializer if self.request.method == 'POST' else AdminUserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin peut modifier et supprimer un compte."""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return User.objects.annotate(
            bookings_count=Count('bookings', distinct=True),
            vehicles_count=Count('vehicles', distinct=True),
            trips_count=Count('driven_bookings', distinct=True),
        )

    def perform_update(self, serializer):
        if serializer.instance == self.request.user and serializer.validated_data.get('is_active') is False:
            raise serializers.ValidationError({'is_active': 'Vous ne pouvez pas suspendre votre propre compte.'})
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.pk == request.user.pk:
            return Response({'detail': 'Vous ne pouvez pas supprimer votre propre compte.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user.delete()
        except ProtectedError:
            return Response(
                {'detail': 'Ce compte est lié à des réservations et ne peut pas être supprimé. Suspendez-le plutôt.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationListView(generics.ListAPIView):
    """Notifications de l'utilisateur connecté — les plus récentes d'abord."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'title', 'is_read']

    def get_queryset(self):
        return self.request.user.notifications.all()

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        unread = request.user.notifications.filter(is_read=False).count()
        return Response({
            'unread': unread,
            'results': self.get_serializer(qs[:100], many=True).data,
        })


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
