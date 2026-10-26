from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminVehicleViewSet, FavoriteViewSet, VehicleFacetsView, VehicleViewSet, VehicleAvailabilityView

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='vehicle-favorite')
router.register(r'', VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('facets/', VehicleFacetsView.as_view(), name='vehicle-facets'),
    path('admin/', AdminVehicleViewSet.as_view({'get': 'list'}), name='admin-vehicle-list'),
    path('admin/<int:pk>/', AdminVehicleViewSet.as_view({
        'get': 'retrieve',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='admin-vehicle-detail'),
    path('<int:vehicle_id>/availability/', VehicleAvailabilityView.as_view()),
    path('', include(router.urls)),
]
