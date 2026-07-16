from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.faq.views import FAQItemViewSet

router = DefaultRouter()
router.register("", FAQItemViewSet, basename="faq")

urlpatterns = [
    path("", include(router.urls)),
]
