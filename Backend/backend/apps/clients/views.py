from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from apps.common.views import BaseAPIView, BaseViewSet
from apps.accounts.permissions import (
    IsClientUser,
    IsClientAdmin,
    IsFinanceManager,
    IsProjectManager,
    IsAdmin,
    IsOwnerOrAdmin,
)
from apps.clients.models import (
    ClientProfile,
    ClientProject,
    ClientDocument,
    Contract,
    Invoice,
    Payment,
    ClientMeeting,
    SupportTicket,
    ClientSettings,
)
from apps.clients.serializers import (
    ClientProfileSerializer,
    ClientProjectSerializer,
    ClientDocumentSerializer,
    ContractSerializer,
    InvoiceSerializer,
    PaymentSerializer,
    ClientMeetingSerializer,
    SupportTicketSerializer,
    ClientSettingsSerializer,
)
from apps.common.services.client_service import ClientService


class ClientDashboardView(BaseAPIView):
    """
    GET /api/v1/client/dashboard/
    Compiles summary statistics and upcoming events for the client.
    """

    permission_classes = [IsAuthenticated, IsClientUser]

    @extend_schema(
        tags=["Client Portal"],
        summary="Retrieve Client Dashboard",
        responses={200: OpenApiResponse(description="Client Dashboard Details")},
    )
    def get(self, request):
        stats = ClientService.get_dashboard(request.user)
        # Serialize lists inside response payload
        stats["recent_documents"] = ClientDocumentSerializer(
            stats["recent_documents"], many=True
        ).data
        stats["upcoming_meetings"] = ClientMeetingSerializer(
            stats["upcoming_meetings"], many=True
        ).data
        return Response({"success": True, "data": stats}, status=status.HTTP_200_OK)


class ClientProfileView(BaseAPIView):
    """
    GET/PUT /api/v1/client/profile/
    Retrieves or updates the authenticated client's company profile.
    """

    permission_classes = [IsAuthenticated, IsClientUser]
    serializer_class = ClientProfileSerializer

    @extend_schema(
        tags=["Client Portal"],
        summary="Retrieve Client Profile",
        responses={200: ClientProfileSerializer},
    )
    def get(self, request):
        profile = ClientService.get_profile(request.user)
        serializer = self.serializer_class(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Client Portal"],
        summary="Update Client Profile",
        request=ClientProfileSerializer,
        responses={200: ClientProfileSerializer},
    )
    def put(self, request):
        profile = ClientService.get_profile(request.user)
        serializer = self.serializer_class(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema_view(
    list=extend_schema(summary="List Client Projects", tags=["Client Projects"]),
    retrieve=extend_schema(summary="Retrieve Project Details", tags=["Client Projects"]),
)
class ClientProjectViewSet(BaseViewSet):
    serializer_class = ClientProjectSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return ClientProject.objects.none()
        if self.request.user.is_superuser or IsAdmin().has_permission(self.request, self):
            return ClientProject.objects.all()
        try:
            profile = ClientService.get_profile(self.request.user)
            return ClientProject.objects.filter(client=profile)
        except Exception:
            return ClientProject.objects.none()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated(), IsClientUser()]
        return [IsAuthenticated(), IsAdmin()]


@extend_schema_view(
    list=extend_schema(summary="List Shared Documents", tags=["Client Documents"]),
    create=extend_schema(summary="Upload Document", tags=["Client Documents"]),
    destroy=extend_schema(summary="Delete Document", tags=["Client Documents"]),
)
class ClientDocumentViewSet(BaseViewSet):
    serializer_class = ClientDocumentSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return ClientDocument.objects.none()
        if self.request.user.is_superuser or IsAdmin().has_permission(self.request, self):
            return ClientDocument.objects.all()
        try:
            profile = ClientService.get_profile(self.request.user)
            return ClientDocument.objects.filter(client=profile, is_visible=True)
        except Exception:
            return ClientDocument.objects.none()

    def get_permissions(self):
        return [IsAuthenticated(), IsClientUser()]

    def perform_create(self, serializer):
        ClientService.upload_document(
            user=self.request.user,
            data=self.request.data,
            uploaded_file=self.request.FILES.get("file"),
        )


@extend_schema_view(
    list=extend_schema(summary="List Contracts", tags=["Client Contracts"]),
    retrieve=extend_schema(summary="Retrieve Contract", tags=["Client Contracts"]),
    create=extend_schema(summary="Create Contract", tags=["Client Contracts"]),
)
class ContractViewSet(BaseViewSet):
    serializer_class = ContractSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Contract.objects.none()
        if self.request.user.is_superuser or IsAdmin().has_permission(self.request, self):
            return Contract.objects.all()
        try:
            profile = ClientService.get_profile(self.request.user)
            return Contract.objects.filter(client=profile)
        except Exception:
            return Contract.objects.none()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated(), IsClientUser()]
        return [IsAuthenticated(), IsAdmin()]


@extend_schema_view(
    list=extend_schema(summary="List Invoices", tags=["Client Invoices"]),
    retrieve=extend_schema(summary="Retrieve Invoice", tags=["Client Invoices"]),
    create=extend_schema(summary="Create Invoice", tags=["Client Invoices"]),
)
class InvoiceViewSet(BaseViewSet):
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Invoice.objects.none()
        if self.request.user.is_superuser or IsAdmin().has_permission(self.request, self) or IsFinanceManager().has_permission(self.request, self):
            return Invoice.objects.all()
        try:
            profile = ClientService.get_profile(self.request.user)
            return Invoice.objects.filter(client=profile)
        except Exception:
            return Invoice.objects.none()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated(), IsClientUser()]
        return [IsAuthenticated(), IsFinanceManager()]


@extend_schema_view(
    list=extend_schema(summary="List Payments", tags=["Client Payments"]),
    create=extend_schema(summary="Record Payment", tags=["Client Payments"]),
)
class PaymentViewSet(BaseViewSet):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Payment.objects.none()
        if self.request.user.is_superuser or IsAdmin().has_permission(self.request, self) or IsFinanceManager().has_permission(self.request, self):
            return Payment.objects.all()
        try:
            profile = ClientService.get_profile(self.request.user)
            return Payment.objects.filter(invoice__client=profile)
        except Exception:
            return Payment.objects.none()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated(), IsClientUser()]
        return [IsAuthenticated(), IsFinanceManager()]

    def perform_create(self, serializer):
        invoice_id = self.request.data.get("invoice")
        ClientService.record_payment(invoice_id, serializer.validated_data)


@extend_schema_view(
    list=extend_schema(summary="List Meetings", tags=["Client Meetings"]),
    create=extend_schema(summary="Schedule Meeting", tags=["Client Meetings"]),
)
class ClientMeetingViewSet(BaseViewSet):
    serializer_class = ClientMeetingSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return ClientMeeting.objects.none()
        if self.request.user.is_superuser or IsAdmin().has_permission(self.request, self):
            return ClientMeeting.objects.all()
        try:
            profile = ClientService.get_profile(self.request.user)
            return ClientMeeting.objects.filter(client=profile)
        except Exception:
            return ClientMeeting.objects.none()

    def get_permissions(self):
        return [IsAuthenticated(), IsClientUser()]

    def perform_create(self, serializer):
        ClientService.schedule_meeting(self.request.user, serializer.validated_data)


@extend_schema_view(
    list=extend_schema(summary="List Support Tickets", tags=["Client Support"]),
    create=extend_schema(summary="Create Support Ticket", tags=["Client Support"]),
    partial_update=extend_schema(summary="Update Support Ticket Status", tags=["Client Support"]),
)
class SupportTicketViewSet(BaseViewSet):
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return SupportTicket.objects.none()
        if self.request.user.is_superuser or IsAdmin().has_permission(self.request, self):
            return SupportTicket.objects.all()
        try:
            profile = ClientService.get_profile(self.request.user)
            return SupportTicket.objects.filter(client=profile)
        except Exception:
            return SupportTicket.objects.none()

    def get_permissions(self):
        return [IsAuthenticated(), IsClientUser()]

    def perform_create(self, serializer):
        ClientService.create_ticket(self.request.user, serializer.validated_data)


class ClientSettingsView(BaseAPIView):
    """
    GET/PUT /api/v1/client/settings/
    Retrieves or updates client preference toggles and notifications.
    """

    permission_classes = [IsAuthenticated, IsClientUser]
    serializer_class = ClientSettingsSerializer

    @extend_schema(
        tags=["Client Portal"],
        summary="Retrieve Preferences",
        responses={200: ClientSettingsSerializer},
    )
    def get(self, request):
        profile = ClientService.get_profile(request.user)
        settings_obj, created = ClientSettings.objects.get_or_create(client=profile)
        serializer = self.serializer_class(settings_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Client Portal"],
        summary="Update Preferences",
        request=ClientSettingsSerializer,
        responses={200: ClientSettingsSerializer},
    )
    def put(self, request):
        profile = ClientService.get_profile(request.user)
        settings_obj, created = ClientSettings.objects.get_or_create(client=profile)
        serializer = self.serializer_class(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
