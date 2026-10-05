from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Notification


class UserSerializer(serializers.ModelSerializer):
    referred_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'is_verified', 'balance',
                  'referral_code', 'commission_rate', 'referred_count', 'created_at']
        read_only_fields = ['id', 'is_verified', 'balance', 'referral_code', 'created_at']

    def get_referred_count(self, obj):
        if obj.role != 'INTERMEDIARY':
            return 0
        return obj.referrals.count() + obj.attributed_bookings.count()


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['title', 'message', 'created_at']


class AdminUserSerializer(serializers.ModelSerializer):
    """Réservé à l'admin — permet d'activer/suspendre/vérifier/changer le rôle."""
    bookings_count = serializers.SerializerMethodField()
    commissions_total = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'balance',
                  'is_active', 'is_verified', 'id_document_verified', 'is_staff',
                  'referral_code', 'commission_rate', 'bookings_count', 'commissions_total',
                  'created_at']
        read_only_fields = ['id', 'created_at']

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
        return User.objects.create_user(**validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2', 'role', 'phone', 'referral_code']

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
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


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
            )
            user.set_unusable_password()
            user.save()
        if not user.is_active:
            raise serializers.ValidationError('Ce compte a été suspendu.')
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }
