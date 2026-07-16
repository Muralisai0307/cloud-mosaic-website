from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsAdmin
from apps.common.services.contact_service import ContactService
from apps.common.views import BaseAPIView
from apps.contact.serializers import ContactSerializer


class ContactCreateView(BaseAPIView):
    serializer_class = ContactSerializer
    success_message = "Contact request submitted successfully."

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAdmin()]
        return [AllowAny()]

    @extend_schema(
        summary="Submit Client Inquiry",
        description="Creates a new client inquiry. Validates full name, email, phone, and inquiry details, checks duplicate spam within a 5-minute window, and schedules mock email notification alerts.",
        tags=["Contact"],
        responses={
            201: OpenApiResponse(
                response=ContactSerializer,
                description="Inquiry request submitted successfully.",
            ),
            400: OpenApiResponse(
                description="Validation Failure (XSS, SQLi, formatting issues)."
            ),
            500: OpenApiResponse(description="Internal Server Error"),
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = ContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Delegate business logic processing to the service layer
        contact = ContactService.create_contact_message(serializer.validated_data)

        # Serialize saved instance for response
        response_serializer = ContactSerializer(contact)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="List Contact Inquiries",
        description="Retrieves a list of all client inquiries. Restricted to Admins.",
        tags=["Contact"],
        responses={
            200: OpenApiResponse(
                response=ContactSerializer(many=True),
                description="List of client inquiries.",
            ),
            401: OpenApiResponse(description="Unauthorized"),
            403: OpenApiResponse(description="Forbidden"),
        },
    )
    def get(self, request, *args, **kwargs):
        contacts = ContactService.get_all_contact_messages()
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
