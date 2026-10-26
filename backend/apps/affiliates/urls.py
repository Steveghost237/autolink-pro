from rest_framework.routers import DefaultRouter
from .views import AgentPayoutViewSet, AgentViewSet

router = DefaultRouter()
router.register('agents', AgentViewSet, basename='affiliate-agent')
router.register('payouts', AgentPayoutViewSet, basename='affiliate-payout')
urlpatterns = router.urls
