from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsAdmin
from apps.common.services.testimonial_service import TestimonialService
from apps.common.views import BaseViewSet
from apps.testimonials.models import Testimonial
from apps.testimonials.serializers import TestimonialSerializer


@extend_schema_view(
    list=extend_schema(
        summary="List Approved Testimonials",
        description="Retrieves a list of all client testimonials approved by the moderator. Supports search (on name, company, review) and filters (on rating, service).",
        tags=["Testimonials"],
    ),
    retrieve=extend_schema(
        summary="Retrieve Testimonial Details",
        description="Retrieves the detailed specifications for a single approved testimonial listing by its database ID.",
        tags=["Testimonials"],
    ),
    update=extend_schema(
        summary="Update Testimonial Status",
        description="Allows admins to approve or reject client testimonials. Restricted to Admins.",
        tags=["Testimonials"],
    ),
    partial_update=extend_schema(
        summary="Partially Update Testimonial Status",
        description="Allows admins to partially approve or reject client testimonials. Restricted to Admins.",
        tags=["Testimonials"],
    ),
    destroy=extend_schema(
        summary="Delete Testimonial",
        description="Allows admins to delete client testimonials. Restricted to Admins.",
        tags=["Testimonials"],
    ),
)
class TestimonialViewSet(BaseViewSet):
    """
    ViewSet for Testimonials. Supports GET list, GET retrieve, POST create, and Admin PUT/PATCH updates.
    """

    serializer_class = TestimonialSerializer
    queryset = Testimonial.objects.all()

    # Enable filter, search, and ordering backends
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["rating", "service"]
    search_fields = ["name", "company", "review"]
    ordering_fields = ["rating", "created_at"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        # Admins can view all testimonials (pending, approved, or rejected)
        if self.action in ["update", "partial_update", "destroy"] or (
            self.request.user and self.request.user.is_authenticated and IsAdmin().has_permission(self.request, self)
        ):
            return Testimonial.objects.all().order_by("-created_at")
        # Public gets only approved testimonials
        return TestimonialService.get_approved_testimonials()

    @extend_schema(
        summary="Submit Testimonial Review",
        description="Creates a new testimonial in pending moderator status. Validates rating is between 1 and 5, review text is between 20 and 1000 characters, and prevents exact duplicate reviews.",
        tags=["Testimonials"],
        responses={
            201: OpenApiResponse(
                response=TestimonialSerializer,
                description="Testimonial submitted successfully, pending approval.",
            ),
            400: OpenApiResponse(
                description="Validation Failure (out of bounds rating, short review, duplicate submission)."
            ),
            500: OpenApiResponse(description="Internal Server Error"),
        },
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Delegate business logic processing to the service layer
        testimonial = TestimonialService.create_testimonial(serializer.validated_data)

        # Serialize saved instance for response
        response_serializer = self.get_serializer(testimonial)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        # Notify status changes via service layer
        TestimonialService.update_testimonial_status(
            serializer.instance, serializer.validated_data.get("status")
        )
        serializer.save()
