from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FavoriteViewSet, VehicleFacetsView, VehicleViewSet, VehicleAvailabilityView

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='vehicle-favorite')
router.register(r'', VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('facets/', VehicleFacetsView.as_view(), name='vehicle-facets'),
    path('<int:vehicle_id>/availability/', VehicleAvailabilityView.as_view()),
    path('', include(router.urls)),
]
