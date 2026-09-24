from django.urls import path
from .views import RegisterView, MeView, UserListView, LoginView, UserDetailView, GoogleAuthView, NotificationListView, NotificationReadView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    path('me/', MeView.as_view(), name='me'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/read/', NotificationReadView.as_view(), name='notifications-read-all'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('', UserListView.as_view(), name='user-list'),
]
