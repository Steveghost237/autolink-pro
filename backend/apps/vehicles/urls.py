from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, VehicleAvailabilityView

router = DefaultRouter()
router.register(r'', VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('<int:vehicle_id>/availability/', VehicleAvailabilityView.as_view()),
    path('', include(router.urls)),
]
