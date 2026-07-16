from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.permissions import AllowAny

from apps.accounts.permissions import IsAdmin
from apps.common.views import BaseViewSet
from apps.faq.models import FAQItem
from apps.faq.serializers import FAQItemSerializer


@extend_schema_view(
    list=extend_schema(summary="List FAQ Items", tags=["FAQ"]),
    retrieve=extend_schema(summary="Retrieve FAQ Item Details", tags=["FAQ"]),
    create=extend_schema(summary="Create FAQ Item", tags=["FAQ"]),
    update=extend_schema(summary="Update FAQ Item", tags=["FAQ"]),
    partial_update=extend_schema(
        summary="Partially Update FAQ Item", tags=["FAQ"]
    ),
    destroy=extend_schema(summary="Delete FAQ Item", tags=["FAQ"]),
)
class FAQItemViewSet(BaseViewSet):
    """
    ViewSet for FAQ items. Public read, Admin write.
    """

    serializer_class = FAQItemSerializer
    queryset = FAQItem.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        if self.action in ["create", "update", "partial_update", "destroy"] or (
            self.request.user and self.request.user.is_authenticated and IsAdmin().has_permission(self.request, self)
        ):
            return FAQItem.objects.all().order_by("category", "question")
        return FAQItem.objects.filter(is_active=True).order_by("category", "question")
    
