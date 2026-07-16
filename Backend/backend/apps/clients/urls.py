from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.clients.views import (
    ClientDashboardView,
    ClientProfileView,
    ClientProjectViewSet,
    ClientDocumentViewSet,
    ContractViewSet,
    InvoiceViewSet,
    PaymentViewSet,
    ClientMeetingViewSet,
    SupportTicketViewSet,
    ClientSettingsView,
)

router = DefaultRouter()
router.register("projects", ClientProjectViewSet, basename="client_projects")
router.register("documents", ClientDocumentViewSet, basename="client_documents")
router.register("contracts", ContractViewSet, basename="client_contracts")
router.register("invoices", InvoiceViewSet, basename="client_invoices")
router.register("payments", PaymentViewSet, basename="client_payments")
router.register("meetings", ClientMeetingViewSet, basename="client_meetings")
router.register("support", SupportTicketViewSet, basename="client_support")

urlpatterns = [
    path("dashboard/", ClientDashboardView.as_view(), name="client_dashboard"),
    path("profile/", ClientProfileView.as_view(), name="client_profile"),
    path("settings/", ClientSettingsView.as_view(), name="client_settings"),
    path("", include(router.urls)),
]
