from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleInspectionViewSet

router = DefaultRouter()
router.register(r'', VehicleInspectionViewSet, basename='inspection')

urlpatterns = [path('', include(router.urls))]
