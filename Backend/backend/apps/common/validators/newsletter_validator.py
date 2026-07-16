from django.core.exceptions import ValidationError
from .common_validator import sanitize_string, validate_email


class NewsletterValidator:
    """
    Validation engine for newsletter subscriptions.
    """

    @staticmethod
    def validate(data):
        from apps.newsletter.models import NewsletterSubscription
        errors = {}

        raw_email = data.get("email")
        if raw_email is None or str(raw_email).strip() == "":
            errors["email"] = "Email address is required."
            raise ValidationError(errors)

        # Sanitize and validate email format
        email = sanitize_string(raw_email)
        try:
            email = validate_email(email)
        except ValidationError as e:
            errors["email"] = list(e.messages)
            raise ValidationError(errors)

        # Duplicate check: check if there is an active subscription with this email
        try:
            subscription = NewsletterSubscription.objects.get(email__iexact=email)
            if subscription.is_active:
                raise ValidationError(
                    {
                        "email": "This email address is already subscribed to the newsletter."
                    }
                )
        except NewsletterSubscription.DoesNotExist:
            pass

        return {"email": email}
