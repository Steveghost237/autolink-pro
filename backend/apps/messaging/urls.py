from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, UnreadCountView

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('unread/', UnreadCountView.as_view(), name='messaging-unread'),
    path('', include(router.urls)),
]
