import logging

logger = logging.getLogger("apps.services.email")


class EmailService:
    """
    Handles asynchronous email dispatches. Logs payloads and provides structures
    for SMTP/transactional email integrations (e.g. SendGrid, Mailgun, SMTP).
    """

    @staticmethod
    def send_contact_notification(contact_message):
        """
        Sends an alert to internal admins when a client submits the contact form.
        """
        logger.info(
            f"[EMAIL MOCK] Notification to Admins: New contact request received from {contact_message.full_name} "
            f"({contact_message.email}). Subject: {contact_message.subject}. Message: {contact_message.message[:50]}..."
        )

    @staticmethod
    def send_newsletter_confirmation(email):
        """
        Sends a welcome confirmation email to a newly subscribed client.
        """
        logger.info(
            f"[EMAIL MOCK] Welcome email to Subscriber ({email}): Thank you for subscribing to Cloud Mosaic updates!"
        )

    @staticmethod
    def send_application_confirmation(application):
        """
        Sends a submission receipt confirmation to a job applicant.
        """
        logger.info(
            f"[EMAIL MOCK] Confirmation email to Applicant ({application.email}): Your application "
            f"for '{application.job.title}' (Ref: {application.reference_number}) was received."
        )

    @staticmethod
    def send_recruiter_notification(application):
        """
        Alerts internal recruiting teams of a new incoming job application.
        """
        logger.info(
            f"[EMAIL MOCK] Alert to Recruiters: New application received for position '{application.job.title}'. "
            f"Candidate: {application.full_name} ({application.email}). Resume saved at: {application.resume.name} "
            f"Reference: {application.reference_number}"
        )

    @staticmethod
    def send_meeting_confirmation(booking):
        """
        Sends a confirmation email containing booking reference details to the client.
        """
        logger.info(
            f"[EMAIL MOCK] Meeting schedule confirmation sent to Client ({booking.email}): "
            f"Scheduled meeting on {booking.meeting_date} at {booking.meeting_time}. "
            f"Booking Ref: {booking.reference_number}"
        )

    @staticmethod
    def send_testimonial_confirmation(testimonial):
        """
        Sends a receipt confirmation email to the testimonial writer.
        """
        logger.info(
            f"[EMAIL MOCK] Testimonial receipt confirmation sent to {testimonial.name} ({testimonial.company}). "
            f"Review status: Pending approval."
        )
