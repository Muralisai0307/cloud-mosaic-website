from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsAdmin
from apps.common.services.newsletter_service import NewsletterService
from apps.common.views import BaseAPIView
from apps.newsletter.serializers import NewsletterSerializer


class NewsletterCreateView(BaseAPIView):
    serializer_class = NewsletterSerializer
    success_message = "Thank you for subscribing to our newsletter!"

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAdmin()]
        return [AllowAny()]

    @extend_schema(
        summary="Subscribe to Newsletter",
        description="Creates a new newsletter subscription. Validates formatting, normalizes email addresses to lower case, and checks for existing active subscriptions to prevent duplicates.",
        tags=["Newsletter"],
        responses={
            201: OpenApiResponse(
                response=NewsletterSerializer,
                description="Subscription created successfully.",
            ),
            400: OpenApiResponse(
                description="Validation Failure (malformed email, duplicate entry)."
            ),
            500: OpenApiResponse(description="Internal Server Error"),
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = NewsletterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Delegate business logic processing to the service layer
        subscription = NewsletterService.subscribe_email(serializer.validated_data)

        # Serialize saved instance for response
        response_serializer = NewsletterSerializer(subscription)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="List Newsletter Subscriptions",
        description="Retrieves a list of all newsletter subscriptions. Restricted to Admins.",
        tags=["Newsletter"],
        responses={
            200: OpenApiResponse(
                response=NewsletterSerializer(many=True),
                description="List of newsletter subscriptions.",
            ),
            401: OpenApiResponse(description="Unauthorized"),
            403: OpenApiResponse(description="Forbidden"),
        },
    )
    def get(self, request, *args, **kwargs):
        subscriptions = NewsletterService.get_all_subscriptions()
        serializer = NewsletterSerializer(subscriptions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
