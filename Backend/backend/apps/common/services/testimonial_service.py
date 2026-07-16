import logging
from django.db import transaction
from apps.testimonials.models import Testimonial
from apps.common.services.email_service import EmailService

logger = logging.getLogger("apps.services.testimonials")


class TestimonialService:
    """
    Handles business logic processes for client testimonials.
    """

    @staticmethod
    def get_approved_testimonials():
        logger.info("Request received: Fetching public testimonials")
        # Public GET should only show approved testimonials
        testimonials = Testimonial.objects.filter(status="approved").order_by("-created_at")
        logger.info(f"Business logic executed: Found {testimonials.count()} approved testimonials")
        return testimonials

    @staticmethod
    def create_testimonial(data):
        logger.info("Request received: Testimonial submission")
        logger.info("Validation passed: Testimonial details")

        # Save testimonial as pending moderator approval
        with transaction.atomic():
            testimonial = Testimonial.objects.create(
                name=data.get("name"),
                company=data.get("company"),
                service=data.get("service"),
                rating=data.get("rating"),
                review=data.get("review"),
                status="pending",  # Enforce pending state
            )
            logger.info(
                f"Database saved: Testimonial ID {testimonial.id} (Status: {testimonial.status})"
            )

        # Dispatch confirmation alert
        EmailService.send_testimonial_confirmation(testimonial)

        return testimonial

    @staticmethod
    def update_testimonial_status(instance, status_value):
        """
        Updates status of testimonial (approves or rejects).
        """
        logger.info(
            f"Request received: Modifying testimonial {instance.id} status to {status_value}"
        )
        if status_value:
            with transaction.atomic():
                instance.status = status_value
                instance.save()
            logger.info(
                f"Database saved: Testimonial ID {instance.id} status is now {instance.status}"
            )
        return instance
