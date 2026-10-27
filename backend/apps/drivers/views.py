from django.db import transaction
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from config.pagination import StandardPagination
from apps.users.models import User
from .models import DriverApplication, DriverEarning, DriverProfile, DriverServiceRequest
from .serializers import (
    DriverApplicationSerializer,
    DriverEarningSerializer,
    DriverProfileSerializer,
    DriverServiceRequestSerializer,
)


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsDriverRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DRIVER'


class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return getattr(obj, 'applicant', None) == request.user or getattr(obj, 'driver', None) == request.user


class DriverApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = DriverApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    pagination_class = StandardPagination
    filterset_fields = ['status']
    search_fields = [
        'applicant__username', 'applicant__email', 'applicant__first_name',
        'applicant__last_name', 'license_number', 'reviewer_notes',
    ]
    ordering_fields = ['applied_at', 'reviewed_at', 'status', 'experience_years']

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return DriverApplication.objects.select_related('applicant', 'reviewer').order_by('-applied_at')
        return DriverApplication.objects.filter(applicant=self.request.user).order_by('-applied_at')

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    def perform_update(self, serializer):
        if self.request.user.role == 'ADMIN':
            with transaction.atomic():
                application = serializer.save(reviewer=self.request.user, reviewed_at=timezone.now())
                if application.status == DriverApplication.Status.APPROVED:
                    User.objects.filter(pk=application.applicant_id).update(role='DRIVER')
                    DriverProfile.objects.get_or_create(driver_id=application.applicant_id)
        elif serializer.instance.status in ('approved', 'rejected'):
            raise PermissionDenied('Cette candidature est déjà clôturée.')
        else:
            serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'ADMIN' and instance.status != 'pending':
            raise PermissionDenied('Seules les candidatures en attente peuvent être supprimées.')
        instance.delete()


class AdminDriverApplicationViewSet(DriverApplicationViewSet):
    permission_classes = [IsAdminRole]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        return DriverApplication.objects.select_related('applicant', 'reviewer').order_by('-applied_at')


class DriverProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    pagination_class = StandardPagination
    filterset_fields = ['is_online', 'assigned_vehicle']
    search_fields = [
        'driver__username', 'driver__email', 'driver__first_name', 'driver__last_name',
    ]
    ordering_fields = [
        'certified_at', 'rating', 'rating_count', 'total_trips', 'total_earned',
        'acceptance_rate', 'on_time_rate',
    ]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return DriverProfile.objects.select_related('driver', 'assigned_vehicle').order_by('-certified_at')
        return DriverProfile.objects.filter(driver=self.request.user).order_by('-certified_at')

    @action(detail=False, methods=['patch'])
    def availability(self, request):
        if request.user.role != 'DRIVER':
            raise PermissionDenied('Cette action est réservée aux chauffeurs.')
        if not isinstance(request.data.get('is_online'), bool):
            raise ValidationError({'is_online': 'Indiquez true ou false.'})
        profile, _ = DriverProfile.objects.get_or_create(driver=request.user)
        profile.is_online = request.data['is_online']
        profile.save(update_fields=['is_online'])
        return Response(self.get_serializer(profile).data)

    @action(detail=False, methods=['get'])
    def earnings(self, request):
        if request.user.role != 'DRIVER':
            raise PermissionDenied('Cette action est réservée aux chauffeurs.')
        profile, _ = DriverProfile.objects.get_or_create(driver=request.user)
        earning_months = {
            row['month'].strftime('%Y-%m'): row
            for row in DriverEarning.objects.filter(driver=request.user)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(earnings=Sum('amount'), trips=Count('id'))
        }
        today = timezone.localdate()
        months = []
        for offset in reversed(range(12)):
            month = today.month - offset
            year = today.year
            while month <= 0:
                month += 12
                year -= 1
            month_key = f'{year:04d}-{month:02d}'
            aggregate = earning_months.get(month_key, {})
            months.append({
                'month': month_key,
                'earnings': aggregate.get('earnings', 0),
                'trips': aggregate.get('trips', 0),
            })
        return Response({
            'total_earned': profile.total_earned,
            'monthly_earnings': months,
            'rating': profile.rating,
            'rating_count': profile.rating_count,
            'total_trips': profile.total_trips,
        })


class DriverEarningListView(viewsets.ReadOnlyModelViewSet):
    serializer_class = DriverEarningSerializer
    permission_classes = [IsDriverRole]
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'booking__vehicle__brand', 'booking__vehicle__model', 'booking__vehicle__plate',
        'booking__client__username', 'booking__client__email',
        'booking__client__first_name', 'booking__client__last_name',
    ]
    ordering_fields = ['created_at', 'amount', 'booking__start_date']
    ordering = ['-created_at']

    def get_queryset(self):
        return DriverEarning.objects.filter(driver=self.request.user).select_related(
            'booking__vehicle', 'booking__client',
        )


class AdminDriverProfileViewSet(DriverProfileViewSet):
    permission_classes = [IsAdminRole]
    http_method_names = ['get', 'head', 'options']

    def get_queryset(self):
        return DriverProfile.objects.select_related('driver', 'assigned_vehicle').order_by('-certified_at')


class DriverServiceRequestViewSet(viewsets.ModelViewSet):
    """Service recrutement/formation de chauffeurs pour propriétaires.
    Le propriétaire crée et suit ses demandes ; l'admin traite le pipeline."""
    serializer_class = DriverServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = DriverServiceRequest.objects.select_related('owner', 'processed_by')
        if self.request.user.role == 'ADMIN':
            return qs.all()
        return qs.filter(owner=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role not in ('OWNER', 'ADMIN'):
            raise PermissionDenied('Service réservé aux propriétaires de véhicules.')
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if self.request.user.role != 'ADMIN':
            raise PermissionDenied("Traitement réservé à l'administration.")
        serializer.save(processed_by=self.request.user)
