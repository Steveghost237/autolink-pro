from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminVehicleViewSet, ControllerPendingVehicleListView, ControllerVehicleDecisionView,
    FavoriteViewSet, VehicleFacetsView, VehicleViewSet, VehicleAvailabilityView,
    MaintenanceRequestViewSet,
)

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='vehicle-favorite')
router.register(r'maintenance', MaintenanceRequestViewSet, basename='maintenance-request')
router.register(r'', VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('facets/', VehicleFacetsView.as_view(), name='vehicle-facets'),
    path('admin/', AdminVehicleViewSet.as_view({'get': 'list'}), name='admin-vehicle-list'),
    path('admin/<int:pk>/', AdminVehicleViewSet.as_view({
        'get': 'retrieve',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='admin-vehicle-detail'),
    path('controller-review/', ControllerPendingVehicleListView.as_view(), name='controller-vehicle-review-list'),
    path('controller-review/<int:pk>/', ControllerVehicleDecisionView.as_view(), name='controller-vehicle-review-detail'),
    path('<int:vehicle_id>/availability/', VehicleAvailabilityView.as_view()),
    path('', include(router.urls)),
]
