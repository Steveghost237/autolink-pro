from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriverApplicationViewSet, DriverProfileViewSet, DriverServiceRequestViewSet
from .views import (
    AdminDriverApplicationViewSet,
    AdminDriverProfileViewSet,
    DriverApplicationViewSet,
    DriverEarningListView,
    DriverProfileViewSet,
)

router = DefaultRouter()
router.register(r'applications', DriverApplicationViewSet, basename='driver-application')
router.register(r'profiles', DriverProfileViewSet, basename='driver-profile')
router.register(r'service-requests', DriverServiceRequestViewSet, basename='driver-service-request')
router.register(r'earnings', DriverEarningListView, basename='driver-earning')

urlpatterns = [
    path('admin/applications/', AdminDriverApplicationViewSet.as_view({'get': 'list'})),
    path('admin/applications/<int:pk>/', AdminDriverApplicationViewSet.as_view({
        'get': 'retrieve', 'patch': 'partial_update',
    })),
    path('admin/profiles/', AdminDriverProfileViewSet.as_view({'get': 'list'})),
    path('admin/profiles/<int:pk>/', AdminDriverProfileViewSet.as_view({'get': 'retrieve'})),
    path('', include(router.urls)),
]
