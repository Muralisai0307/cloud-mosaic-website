import logging
from django.db import transaction
from apps.newsletter.models import NewsletterSubscription
from apps.common.services.email_service import EmailService

logger = logging.getLogger("apps.services.newsletter")


class NewsletterService:
    """
    Handles business logic processes for newsletter subscriptions.
    """

    @staticmethod
    def subscribe_email(data):
        logger.info("Request received: Newsletter subscription signup")
        email = data.get("email")

        try:
            subscription = NewsletterSubscription.objects.get(email__iexact=email)
            # Active check is verified by the validator. This is an inactive subscription to reactivate.
            logger.info(f"Validation passed: Reactivating inactive subscription for {email}")
            with transaction.atomic():
                subscription.is_active = True
                subscription.save()
                logger.info(f"Database saved: Subscription reactivated for {email}")

        except NewsletterSubscription.DoesNotExist:
            logger.info(f"Validation passed: Creating new subscription for {email}")
            with transaction.atomic():
                subscription = NewsletterSubscription.objects.create(
                    email=email, is_active=True
                )
                logger.info(f"Database saved: New subscription ID {subscription.id}")

        # Trigger mock welcome email notification
        EmailService.send_newsletter_confirmation(email)

        return subscription

    @staticmethod
    def get_all_subscriptions():
        logger.info("Request received: Fetching all newsletter subscriptions")
        return NewsletterSubscription.objects.all().order_by("-subscribed_at")
