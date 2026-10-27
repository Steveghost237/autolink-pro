from django.urls import path
from .views import (
    GoogleAuthView, LoginView, MeView,
    NewsletterCampaignListView, NewsletterCampaignDetailView, NewsletterResendView,
    NewsletterSendView, NewsletterUnsubscribeView,
    NotificationListView, NotificationReadView,
    OTPRequestView, OTPVerifyView, RegisterView, UserDetailView, UserListView,
    MessageListView, MessageThreadsView, MessageContactsView, MessageReadView,
    PlatformSettingsView, PublicConfigView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    path('otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('newsletter/unsubscribe/', NewsletterUnsubscribeView.as_view(), name='newsletter-unsubscribe'),
    path('newsletter/campaigns/', NewsletterCampaignListView.as_view(), name='newsletter-campaigns'),
    path('newsletter/campaigns/<int:pk>/', NewsletterCampaignDetailView.as_view(), name='newsletter-campaign-detail'),
    path('newsletter/campaigns/<int:pk>/resend/', NewsletterResendView.as_view(), name='newsletter-campaign-resend'),
    path('newsletter/send/', NewsletterSendView.as_view(), name='newsletter-send'),
    path('me/', MeView.as_view(), name='me'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/read/', NotificationReadView.as_view(), name='notifications-read-all'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    # Messagerie interne + paramètres plateforme
    path('messages/threads/', MessageThreadsView.as_view(), name='message-threads'),
    path('messages/contacts/', MessageContactsView.as_view(), name='message-contacts'),
    path('messages/read/', MessageReadView.as_view(), name='message-read'),
    path('messages/', MessageListView.as_view(), name='messages'),
    path('settings/', PlatformSettingsView.as_view(), name='platform-settings'),
    path('public-config/', PublicConfigView.as_view(), name='public-config'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('', UserListView.as_view(), name='user-list'),
]
