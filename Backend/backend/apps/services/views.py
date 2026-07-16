from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.permissions import AllowAny

from apps.accounts.permissions import IsAdmin
from apps.common.views import BaseViewSet
from apps.services.models import Service
from apps.services.serializers import ServiceSerializer


@extend_schema_view(
    list=extend_schema(summary="List Services", tags=["Services"]),
    retrieve=extend_schema(summary="Retrieve Service Details", tags=["Services"]),
    create=extend_schema(summary="Create Service", tags=["Services"]),
    update=extend_schema(summary="Update Service", tags=["Services"]),
    partial_update=extend_schema(
        summary="Partially Update Service", tags=["Services"]
    ),
    destroy=extend_schema(summary="Delete Service", tags=["Services"]),
)
class ServiceViewSet(BaseViewSet):
    """
    ViewSet for Services. Public read, Admin write.
    """

    serializer_class = ServiceSerializer
    queryset = Service.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        if self.action in ["create", "update", "partial_update", "destroy"] or (
            self.request.user and self.request.user.is_authenticated and IsAdmin().has_permission(self.request, self)
        ):
            return Service.objects.all().order_by("name")
        return Service.objects.filter(is_active=True).order_by("name")
