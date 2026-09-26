from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Notification
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, AdminUserSerializer, GoogleAuthSerializer, NotificationSerializer


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


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']


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
