from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from .email_utils import (
    get_request_language,
    send_login_notification,
    send_welcome_email,
)
from .models import ContactMessage, NewsletterCampaign, Notification, PlatformSettings, User


class UserSerializer(serializers.ModelSerializer):
    referred_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'is_verified',
                  'newsletter_opt_in', 'language', 'balance',
                  'referral_code', 'commission_rate', 'referred_count', 'created_at']
        read_only_fields = ['id', 'is_verified', 'balance', 'referral_code', 'created_at']

    def get_referred_count(self, obj):
        if obj.role != 'INTERMEDIARY':
            return 0
        return obj.referrals.count() + obj.attributed_bookings.count()
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'is_verified', 'newsletter_opt_in', 'language', 'balance',
                  'city', 'address', 'date_of_birth', 'id_document', 'id_document_verified', 'driving_license',
                  'driving_license_expires_at', 'kyc_status', 'kyc_note', 'kyc_submitted_at', 'created_at']
        read_only_fields = ['id', 'is_verified', 'balance', 'id_document', 'id_document_verified', 'driving_license',
                            'kyc_status', 'kyc_note', 'kyc_submitted_at', 'created_at']


class KYCUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id_document', 'driving_license', 'driving_license_expires_at']

    def validate(self, attrs):
        if not attrs.get('id_document') and not attrs.get('driving_license'):
            raise serializers.ValidationError('Ajoutez au moins une pièce justificative.')
        for field in ('id_document', 'driving_license'):
            document = attrs.get(field)
            if not document:
                continue
            if document.size > 8 * 1024 * 1024:
                raise serializers.ValidationError({field: 'Fichier trop volumineux (8 Mo max).'})
            if not document.name.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.pdf')):
                raise serializers.ValidationError({field: 'Formats acceptés : JPG, PNG, WEBP ou PDF.'})
        return attrs


class PlatformSettingsSerializer(serializers.ModelSerializer):
    tiers = serializers.SerializerMethodField()

    class Meta:
        model = PlatformSettings
        exclude = ['id']
        read_only_fields = ['updated_at']

    def get_tiers(self, obj):
        """Barème de classification véhicules (lecture seule, défini dans apps.vehicles)."""
        from apps.vehicles.models import PRICE_MARGIN, TIER_BASE, TIER_DEPOSIT, TIER_KM, Vehicle
        labels = dict(Vehicle.Tier.choices)
        return [{
            'tier': tier,
            'label': labels.get(tier, tier),
            'base_rate': base,
            'min_rate': int(base * (1 - PRICE_MARGIN)),
            'max_rate': int(base * (1 + PRICE_MARGIN)),
            'deposit': TIER_DEPOSIT[tier],
            'km_included': TIER_KM[tier][0],
            'extra_km_rate': TIER_KM[tier][1],
            'vehicles': Vehicle.objects.filter(tier=tier).count(),
        } for tier, base in TIER_BASE.items()]

    def validate_commission_rate(self, value):
        if not 0 <= value <= 1:
            raise serializers.ValidationError('Le taux doit être compris entre 0 et 1.')
        return value


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['title', 'message', 'created_at']




class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = ['commission_rate', 'intermediary_default_rate', 'driver_service_price',
                  'support_email', 'support_phone', 'updated_at']
        read_only_fields = ['updated_at']
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'last_name', 'first_name', 'phone', 'email', 'rental_type',
                  'message', 'created_at', 'is_handled']
        read_only_fields = ['id', 'created_at', 'is_handled']


class ContactMessageAdminSerializer(ContactMessageSerializer):
    class Meta(ContactMessageSerializer.Meta):
        read_only_fields = ['id', 'created_at']


class NewsletterCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterCampaign
        fields = ['id', 'subject', 'body', 'sent_at', 'recipients_count', 'sent_by']
        read_only_fields = fields


class NewsletterSendSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=200)
    html_body = serializers.CharField(required=False, allow_blank=True, default='')
    text_body = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        if not attrs['html_body'].strip() and not attrs['text_body'].strip():
            raise serializers.ValidationError('Le contenu HTML ou texte est obligatoire.')
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """Réservé à l'admin — permet d'activer/suspendre/vérifier/changer le rôle."""
    bookings_count = serializers.SerializerMethodField()
    commissions_total = serializers.SerializerMethodField()
    vehicles_count = serializers.IntegerField(read_only=True)
    trips_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'balance',
                  'is_active', 'is_verified', 'id_document_verified', 'is_staff',
                  'referral_code', 'commission_rate', 'bookings_count', 'commissions_total',
                  'vehicles_count', 'trips_count', 'created_at',
                  'city', 'id_document', 'driving_license', 'driving_license_expires_at',
                  'kyc_status', 'kyc_note', 'kyc_submitted_at']
        read_only_fields = ['id', 'created_at', 'id_document', 'driving_license', 'kyc_submitted_at']

    def get_bookings_count(self, obj):
        if obj.role == 'INTERMEDIARY':
            return obj.attributed_bookings.count()
        return obj.bookings.count()

    def get_commissions_total(self, obj):
        if obj.role != 'INTERMEDIARY':
            return 0
        from django.db.models import Sum
        return obj.attributed_bookings.aggregate(s=Sum('intermediary_commission'))['s'] or 0


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Création de compte par un admin (ex. intermédiaire, contrôleur).
    Le mot de passe initial est communiqué manuellement au nouveau membre."""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                  'phone', 'password', 'commission_rate', 'is_verified']
        read_only_fields = ['id']

    def validate(self, attrs):
        attrs['email'] = attrs.get('email', '').strip().lower()
        if attrs['email'] and User.objects.filter(email__iexact=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'Un compte existe déjà avec cet email.'})
        if not attrs.get('username'):
            base = attrs['email'].split('@')[0]
            username, i = base, 1
            while User.objects.filter(username=username).exists():
                i += 1
                username = f'{base}{i}'
            attrs['username'] = username
        return attrs

    def create(self, validated_data):
        # Taux de commission par défaut configurable via PlatformSettings
        if validated_data.get('role') == 'INTERMEDIARY' and 'commission_rate' not in validated_data:
            try:
                from decimal import Decimal
                validated_data['commission_rate'] = Decimal(
                    str(PlatformSettings.load().intermediary_default_rate))
            except Exception:
                pass
        return User.objects.create_user(**validated_data)


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'phone', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2', 'role', 'phone', 'referral_code']
    agent_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2', 'role', 'phone', 'agent_code']

    # Rôles ouverts à l'inscription publique — ADMIN/CONTROLLER sont créés
    # uniquement par un admin existant, jamais via le formulaire public.
    # DRIVER : retiré de l'inscription publique (données conservées en base).
    PUBLIC_ROLES = ('CLIENT', 'OWNER', 'INTERMEDIARY')

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        email = attrs.get('email', '').strip().lower()
        if email and User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({'email': 'Un compte existe déjà avec cet email.'})
        attrs['email'] = email
        if attrs.get('role') not in self.PUBLIC_ROLES:
            attrs['role'] = 'CLIENT'
        # Code parrain d'un intermédiaire — rattache le filleul
        code = (attrs.pop('referral_code', '') or '').strip().upper()
        if code:
            sponsor = User.objects.filter(
                referral_code=code, role='INTERMEDIARY', is_active=True).first()
            if sponsor is None:
                raise serializers.ValidationError({'referral_code': 'Code intermédiaire invalide.'})
            attrs['referred_by'] = sponsor
        code = attrs.get('agent_code', '').strip()
        if code:
            from apps.affiliates.models import Agent
            agent = Agent.objects.filter(code=code, is_active=True).first()
            if not agent:
                raise serializers.ValidationError({'agent_code': 'Code agent invalide.'})
            attrs['referring_agent'] = agent
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        agent = validated_data.pop('referring_agent', None)
        validated_data.pop('agent_code', None)
        user = User.objects.create_user(**validated_data)
        if agent:
            from apps.affiliates.models import AgentReferral
            AgentReferral.objects.create(agent=agent, referred_user=user)
        return user


class LoginSerializer(serializers.Serializer):
    """Login par email — retourne tokens JWT + profil utilisateur."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = User.objects.filter(email__iexact=attrs['email'].strip()).first()
        if user is None:
            raise serializers.ValidationError('Email ou mot de passe incorrect.')
        if not user.check_password(attrs['password']) or not user.is_active:
            raise serializers.ValidationError('Email ou mot de passe incorrect.')
        send_login_notification(user)
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }


class GoogleAuthSerializer(serializers.Serializer):
    """Connexion / inscription via compte Google (Gmail)."""

    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')
    google_id = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        email = attrs['email'].strip().lower()
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
                username=username,
                email=email,
                first_name=attrs.get('first_name', ''),
                last_name=attrs.get('last_name', ''),
                role='CLIENT',
                is_verified=True,
                language=get_request_language(self.context.get('request')),
            )
            user.set_unusable_password()
            user.save()
        if not user.is_active:
            raise serializers.ValidationError('Ce compte a été suspendu.')
        if created:
            send_welcome_email(user)
        send_login_notification(user)
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }
