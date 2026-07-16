import logging
from django.db import transaction
from apps.meetings.models import MeetingBooking
from apps.common.services.email_service import EmailService
from apps.common.validators import generate_reference_number

logger = logging.getLogger("apps.services.meetings")


class MeetingService:
    """
    Handles business logic processes for scheduling consulting appointments.
    """

    @staticmethod
    def book_meeting(data):
        logger.info("Request received: Meeting scheduling request")
        logger.info("Validation passed: Meeting booking details")

        # Reference code generation
        ref_number = generate_reference_number("MTG")

        # Database save inside transaction block
        with transaction.atomic():
            booking = MeetingBooking.objects.create(
                full_name=data.get("full_name"),
                email=data.get("email"),
                phone=data.get("phone"),
                company=data.get("company", ""),
                service=data.get("service"),
                meeting_date=data.get("meeting_date"),
                meeting_time=data.get("meeting_time"),
                message=data.get("message", ""),
                reference_number=ref_number,
            )
            logger.info(f"Database saved: MeetingBooking ID {booking.id}")

        # Calendar payload preparation mock log
        logger.info(
            f"[CALENDAR INTEGRATION MOCK] Preparing integration payload for Google Calendar / Outlook: "
            f"Event: {booking.service} with {booking.full_name}. Time: {booking.meeting_date}T{booking.meeting_time}. Ref: {ref_number}"
        )

        # Dispatch welcome/confirm alerts
        EmailService.send_meeting_confirmation(booking)

        return booking

    @staticmethod
    def get_all_meetings():
        logger.info("Request received: Fetching all scheduled meetings")
        return MeetingBooking.objects.all().order_by("-meeting_date", "-meeting_time")

    @staticmethod
    def update_meeting(instance, data):
        logger.info(f"Request received: Updating meeting booking {instance.id}")
        with transaction.atomic():
            for key, value in data.items():
                setattr(instance, key, value)
            instance.save()
            logger.info(f"Database saved: Updated MeetingBooking ID {instance.id}")
        return instance
