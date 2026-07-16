from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.careers.views import JobViewSet, JobApplicationCreateView

router = DefaultRouter()
router.register("jobs", JobViewSet, basename="job")

urlpatterns = [
    path("", include(router.urls)),
    path("apply/", JobApplicationCreateView.as_view(), name="job-apply"),
]
