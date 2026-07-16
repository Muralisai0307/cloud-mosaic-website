from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Django Admin Panel
    path("admin/", admin.site.urls),
    # OpenAPI / Swagger UI / ReDoc Schema Endpoints
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # API v1 endpoints
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/contact/", include("apps.contact.urls")),
    path("api/v1/newsletter/", include("apps.newsletter.urls")),
    path("api/v1/careers/", include("apps.careers.urls")),
    path("api/v1/meetings/", include("apps.meetings.urls")),
    path("api/v1/testimonials/", include("apps.testimonials.urls")),
    path("api/v1/services/", include("apps.services.urls")),
    path("api/v1/faq/", include("apps.faq.urls")),
    path("api/v1/", include("apps.employees.urls")),
    path("api/v1/client/", include("apps.clients.urls")),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


