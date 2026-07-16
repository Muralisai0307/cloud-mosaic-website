import logging
from django.utils import timezone
from django.db.models import Q
from rest_framework.exceptions import ValidationError, PermissionDenied

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

logger = logging.getLogger("apps.auth")


class ClientService:
    """
    Service layer containing all client portal transaction logic.
    """

    @staticmethod
    def get_profile(user):
        """
        Gets the client profile corresponding to the user.
        """
        profile = ClientProfile.objects.filter(user=user, is_active=True).first()
        if not profile:
            raise PermissionDenied("Active client profile not found for this user account.")
        return profile

    @staticmethod
    def get_dashboard(user):
        """
        Compiles high-level dashboard metrics for the client portal.
        """
        profile = ClientService.get_profile(user)
        today = timezone.now().date()

        active_projects_count = ClientProject.objects.filter(
            client=profile, status="Active"
        ).count()

        pending_invoices = Invoice.objects.filter(
            client=profile, status__in=["Pending", "Sent", "Overdue"]
        )
        pending_invoices_count = pending_invoices.count()

        recent_docs = ClientDocument.objects.filter(
            client=profile, is_visible=True
        ).order_by("-uploaded_at")[:5]

        upcoming_meetings = ClientMeeting.objects.filter(
            client=profile, meeting_date__gte=today, status="Scheduled"
        ).order_by("meeting_date", "meeting_time")[:5]

        open_tickets_count = SupportTicket.objects.filter(
            client=profile, status__in=["Open", "In Progress"]
        ).count()

        return {
            "company_name": profile.company_name,
            "company_email": profile.company_email,
            "contact_person": profile.contact_person,
            "active_projects_count": active_projects_count,
            "pending_invoices_count": pending_invoices_count,
            "recent_documents": recent_docs,
            "upcoming_meetings": upcoming_meetings,
            "open_support_tickets_count": open_tickets_count,
        }

    @staticmethod
    def get_client_projects(user):
        profile = ClientService.get_profile(user)
        return ClientProject.objects.filter(client=profile)

    @staticmethod
    def get_project_details(user, project_id):
        profile = ClientService.get_profile(user)
        project = ClientProject.objects.filter(id=project_id, client=profile).first()
        if not project:
            raise PermissionDenied("Access to this project is denied or it does not exist.")
        return project

    @staticmethod
    def upload_document(user, data, uploaded_file):
        """
        Handles document uploading ensuring size limits and client ownership.
        """
        profile = ClientService.get_profile(user)
        project_id = data.get("project")
        project = None
        if project_id:
            project = ClientProject.objects.filter(id=project_id, client=profile).first()
            if not project:
                raise ValidationError({"project": "Invalid or inaccessible project ID."})

        # Size check (limit to 10MB)
        if uploaded_file.size > 10 * 1024 * 1024:
            raise ValidationError({"file": "File size exceeds limit of 10MB."})

        # Extension check
        allowed_exts = [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".png", ".jpg", ".jpeg"]
        import os
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext not in allowed_exts:
            raise ValidationError({"file": f"Unsupported file type '{ext}'."})

        doc = ClientDocument.objects.create(
            client=profile,
            project=project,
            title=data.get("title"),
            document_type=data.get("document_type", "Other"),
            file=uploaded_file,
            uploaded_by=user,
            is_visible=True,
        )
        logger.info(f"Document '{doc.title}' uploaded by client {user.username}")
        return doc

    @staticmethod
    def list_documents(user):
        profile = ClientService.get_profile(user)
        return ClientDocument.objects.filter(client=profile, is_visible=True)

    @staticmethod
    def get_document_details(user, doc_id):
        profile = ClientService.get_profile(user)
        doc = ClientDocument.objects.filter(id=doc_id, client=profile).first()
        if not doc:
            raise PermissionDenied("Access to this document is denied.")
        return doc

    @staticmethod
    def create_contract(client_id, data):
        client = ClientProfile.objects.get(id=client_id)
        contract = Contract.objects.create(
            client=client,
            project_id=data.get("project"),
            contract_number=data.get("contract_number"),
            title=data.get("title"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            contract_value=data.get("contract_value"),
            status=data.get("status", "Draft"),
        )
        return contract

    @staticmethod
    def update_contract_status(contract_id, status_value):
        contract = Contract.objects.get(id=contract_id)
        contract.status = status_value
        contract.save()
        return contract

    @staticmethod
    def generate_invoice(client_id, data):
        client = ClientProfile.objects.get(id=client_id)
        invoice = Invoice.objects.create(
            client=client,
            project_id=data.get("project"),
            invoice_number=data.get("invoice_number"),
            amount=data.get("amount"),
            due_date=data.get("due_date"),
            status=data.get("status", "Draft"),
        )
        return invoice

    @staticmethod
    def get_invoice_history(user):
        profile = ClientService.get_profile(user)
        return Invoice.objects.filter(client=profile)

    @staticmethod
    def get_invoice_details(user, invoice_id):
        profile = ClientService.get_profile(user)
        invoice = Invoice.objects.filter(id=invoice_id, client=profile).first()
        if not invoice:
            raise PermissionDenied("Access to this invoice is denied.")
        return invoice

    @staticmethod
    def record_payment(invoice_id, data):
        invoice = Invoice.objects.get(id=invoice_id)
        payment = Payment.objects.create(
            invoice=invoice,
            payment_reference=data.get("payment_reference"),
            amount=data.get("amount"),
            payment_method=data.get("payment_method"),
            status=data.get("status", "Pending"),
        )
        # Update invoice status on completed payments
        if payment.status == "Completed":
            invoice.status = "Paid"
            invoice.save()
        return payment

    @staticmethod
    def update_payment_status(payment_id, status_value):
        payment = Payment.objects.get(id=payment_id)
        payment.status = status_value
        payment.save()
        if status_value == "Completed":
            invoice = payment.invoice
            invoice.status = "Paid"
            invoice.save()
        return payment

    @staticmethod
    def schedule_meeting(user, data):
        profile = ClientService.get_profile(user)
        meeting = ClientMeeting.objects.create(
            client=profile,
            title=data.get("title"),
            meeting_date=data.get("meeting_date"),
            meeting_time=data.get("meeting_time"),
            meeting_link=data.get("meeting_link"),
            status="Scheduled",
        )
        return meeting

    @staticmethod
    def cancel_meeting(user, meeting_id):
        profile = ClientService.get_profile(user)
        meeting = ClientMeeting.objects.filter(id=meeting_id, client=profile).first()
        if not meeting:
            raise PermissionDenied("Access to this meeting booking is denied.")
        meeting.status = "Cancelled"
        meeting.save()
        return meeting

    @staticmethod
    def create_ticket(user, data):
        profile = ClientService.get_profile(user)
        ticket = SupportTicket.objects.create(
            client=profile,
            subject=data.get("subject"),
            description=data.get("description"),
            priority=data.get("priority", "Medium"),
            status="Open",
        )
        return ticket

    @staticmethod
    def update_ticket_status(ticket_id, status_value):
        ticket = SupportTicket.objects.get(id=ticket_id)
        ticket.status = status_value
        ticket.save()
        return ticket
