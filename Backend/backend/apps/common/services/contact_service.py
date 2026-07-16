import logging
from django.db import transaction
from apps.contact.models import ContactMessage
from apps.common.services.email_service import EmailService

logger = logging.getLogger("apps.services.contact")


class ContactService:
    """
    Handles business logic processes for client inquiries.
    """

    @staticmethod
    def create_contact_message(data):
        logger.info("Request received: Contact message submission")
        logger.info("Validation passed: Contact message details")

        # Save inside database transaction
        with transaction.atomic():
            contact = ContactMessage.objects.create(
                full_name=data.get("full_name"),
                company_name=data.get("company_name", ""),
                email=data.get("email"),
                phone=data.get("phone"),
                service=data.get("service"),
                subject=data.get("subject"),
                message=data.get("message"),
            )
            logger.info(f"Database saved: ContactMessage ID {contact.id}")

        # Trigger mock email notification
        EmailService.send_contact_notification(contact)

        return contact

    @staticmethod
    def get_all_contact_messages():
        logger.info("Request received: Fetching all contact messages")
        return ContactMessage.objects.all().order_by("-created_at")
