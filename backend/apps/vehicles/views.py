from datetime import date
from django.db.models import Max, Q
import django_filters
from rest_framework import generics, permissions, filters, status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from .models import Favorite, Vehicle, VehicleAvailability, VehiclePhoto
from .serializers import VehicleMediaUploadSerializer, VehicleSerializer, VehicleAvailabilitySerializer, VehiclePhotoSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user or request.user.role in ('ADMIN', 'CONTROLLER') or request.user.is_staff


class VehicleFilter(django_filters.FilterSet):
    min_rate = django_filters.NumberFilter(field_name='daily_rate', lookup_expr='gte')
    max_rate = django_filters.NumberFilter(field_name='daily_rate', lookup_expr='lte')
    brand = django_filters.CharFilter(field_name='brand', lookup_expr='iexact')
    model = django_filters.CharFilter(field_name='model', lookup_expr='iexact')

    class Meta:
        model = Vehicle
        fields = ['category', 'fuel']


class VehicleViewSet(ModelViewSet):
    queryset = Vehicle.objects.filter(status='approved')
    serializer_class = VehicleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VehicleFilter
    search_fields = ['brand', 'model', 'plate', 'category']
    ordering_fields = ['computed_rate', 'rating', 'year', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status='pending')

    def get_queryset(self):
        qs = Vehicle.objects.all()
        if self.request.user.is_authenticated:
            if self.request.user.role in ['ADMIN', 'CONTROLLER']:
                return qs
            if self.request.user.role == 'OWNER':
                if self.request.query_params.get('mine'):
                    return qs.filter(owner=self.request.user)
                if self.action == 'retrieve':
                    return qs.filter(Q(owner=self.request.user) | Q(status='approved'))
                if self.action in ('update', 'partial_update', 'destroy', 'media', 'delete_media'):
                    return qs.filter(owner=self.request.user)
        qs = qs.filter(status='approved')
        if self.request.query_params.get('available') == '1':
            start = self.request.query_params.get('start_date') or date.today().isoformat()
            end = self.request.query_params.get('end_date') or start
            try:
                date.fromisoformat(start)
                date.fromisoformat(end)
            except ValueError:
                return qs.none()
            from apps.bookings.models import Booking
            booked = Booking.objects.filter(
                status__in=('confirmed', 'active'),
                start_date__lte=end,
                end_date__gte=start,
            ).values('vehicle_id')
            qs = qs.exclude(id__in=booked)
        return qs

    def perform_update(self, serializer):
        vehicle = self.get_object()
        data = serializer.validated_data
        sensitive = any(data.get(field, getattr(vehicle, field)) != getattr(vehicle, field)
                        for field in ('brand', 'model', 'year', 'plate'))
        if self.request.user.role == 'OWNER' and vehicle.status == 'approved' and sensitive:
            serializer.save(status='pending')
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        vehicle = self.get_object()
        if vehicle.bookings.exists():
            return Response(
                {'detail': 'Ce véhicule possède des réservations. Retirez-le du catalogue au lieu de le supprimer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        vehicle.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post', 'get'], parser_classes=[MultiPartParser, FormParser])
    def media(self, request, pk=None):
        vehicle = self.get_object()
        if request.method == 'GET':
            return Response(VehiclePhotoSerializer(vehicle.photos.order_by('position', 'id'), many=True, context={'request': request}).data)
        uploads = request.FILES.getlist('files') or request.FILES.getlist('files[]')
        if not uploads:
            return Response({'files': 'Ajoutez au moins un fichier.'}, status=status.HTTP_400_BAD_REQUEST)
        serializers = []
        for file in uploads:
            serializer = VehicleMediaUploadSerializer(data={
                'image': file,
                'position': request.data.get('position', 'exterior'),
                'caption': request.data.get('caption', ''),
            })
            serializer.is_valid(raise_exception=True)
            serializers.append(serializer)
        created = [serializer.save(vehicle=vehicle) for serializer in serializers]
        if not vehicle.image_url:
            cover = next((photo for photo in created if photo.kind == 'image'), None)
            if cover:
                vehicle.image_url = request.build_absolute_uri(cover.image.url)
                vehicle.save(update_fields=['image_url', 'updated_at'])
        return Response(VehiclePhotoSerializer(created, many=True, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='media/(?P<media_id>[^/.]+)')
    def delete_media(self, request, pk=None, media_id=None):
        vehicle = self.get_object()
        try:
            media = vehicle.photos.get(pk=media_id)
        except VehiclePhoto.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        media.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VehicleFacetsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        vehicles = Vehicle.objects.filter(status='approved')
        brands = list(vehicles.order_by('brand').values_list('brand', flat=True).distinct())
        models = {
            brand: list(vehicles.filter(brand=brand).order_by('model').values_list('model', flat=True).distinct())
            for brand in brands
        }
        return Response({
            'brands': brands,
            'models': models,
            'categories': list(vehicles.order_by('category').values_list('category', flat=True).distinct()),
            'fuels': list(vehicles.order_by('fuel').values_list('fuel', flat=True).distinct()),
            'max_rate': vehicles.aggregate(max_rate=Max('daily_rate'))['max_rate'] or 0,
        })


class FavoriteViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('vehicle')

    def list(self, request, *args, **kwargs):
        vehicles = VehicleSerializer([favorite.vehicle for favorite in self.get_queryset()], many=True, context={'request': request})
        return Response(vehicles.data)

    def create(self, request, *args, **kwargs):
        vehicle_id = request.data.get('vehicle')
        try:
            vehicle = Vehicle.objects.get(pk=vehicle_id, status='approved')
        except (Vehicle.DoesNotExist, ValueError, TypeError):
            return Response({'vehicle': 'Véhicule introuvable.'}, status=status.HTTP_400_BAD_REQUEST)
        Favorite.objects.get_or_create(user=request.user, vehicle=vehicle)
        return Response({'vehicle': vehicle.pk}, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        favorite = self.get_queryset().filter(vehicle_id=kwargs['pk']).first()
        if favorite:
            favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VehicleAvailabilityView(generics.ListCreateAPIView):
    serializer_class = VehicleAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['start_date', 'end_date']
    search_fields = ['vehicle__brand', 'vehicle__model', 'vehicle__plate', 'reason']
    ordering_fields = ['start_date', 'end_date', 'vehicle__brand']

    def get_queryset(self):
        return VehicleAvailability.objects.filter(vehicle_id=self.kwargs['vehicle_id'])

    def perform_create(self, serializer):
        serializer.save(vehicle_id=self.kwargs['vehicle_id'])
