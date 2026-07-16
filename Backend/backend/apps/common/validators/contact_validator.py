import re
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
from .common_validator import sanitize_string, validate_email, validate_phone


class ContactValidator:
    """
    Validation engine for client inquiries / contact form.
    """

    @staticmethod
    def validate(data):
        from apps.contact.models import ContactMessage
        errors = {}

        # 1. Required fields checks (non-empty & non-whitespace only)
        required_fields = [
            "full_name",
            "company_name",
            "email",
            "phone",
            "service",
            "subject",
            "message",
        ]
        for field in required_fields:
            val = data.get(field)
            if val is None or str(val).strip() == "":
                errors[field] = "This field is required."

        if errors:
            raise ValidationError(errors)

        # 2. Field-level parsing and sanitization (SQLi/XSS prevention + emoji removal)
        full_name = sanitize_string(data["full_name"])
        company_name = sanitize_string(data["company_name"])
        email = sanitize_string(data["email"])
        phone = sanitize_string(data["phone"])
        service = sanitize_string(data["service"])
        subject = sanitize_string(data["subject"])
        message = sanitize_string(data["message"])

        # 3. Specific validation rules
        # Name: Min 3, Max 100, no numbers, no special symbols (only alphabets and spaces)
        if len(full_name) < 3:
            errors["full_name"] = "Full name must be at least 3 characters long."
        elif len(full_name) > 100:
            errors["full_name"] = "Full name cannot exceed 100 characters."
        elif not re.match(r"^[a-zA-Z\s]+$", full_name):
            errors["full_name"] = (
                "Full name can only contain letters and spaces."
            )

        # Company: Max 150
        if len(company_name) > 150:
            errors["company_name"] = (
                "Company name cannot exceed 150 characters."
            )

        # Email: Valid format, Lowercase, Max 254
        try:
            email = validate_email(email)
            if len(email) > 254:
                errors["email"] = "Email cannot exceed 254 characters."
        except ValidationError as e:
            errors["email"] = list(e.messages)

        # Phone: Valid international format
        try:
            phone = validate_phone(phone)
        except ValidationError as e:
            errors["phone"] = list(e.messages)

        # Subject: Max 200
        if len(subject) > 200:
            errors["subject"] = "Subject cannot exceed 200 characters."

        # Message: Min 20, Max 2000
        if len(message) < 20:
            errors["message"] = "Message must be at least 20 characters long."
        elif len(message) > 2000:
            errors["message"] = "Message cannot exceed 2000 characters."

        if errors:
            raise ValidationError(errors)

        # 4. Duplicate checks (5-minute span spam check)
        time_threshold = timezone.now() - timedelta(minutes=5)
        duplicate_exists = ContactMessage.objects.filter(
            email__iexact=email,
            subject__iexact=subject,
            message__iexact=message,
            created_at__gte=time_threshold,
        ).exists()

        if duplicate_exists:
            raise ValidationError(
                {
                    "message": "You have already submitted an inquiry with this subject and message recently. Please wait a few minutes."
                }
            )

        # Return cleaned, validated and normalized dictionary
        return {
            "full_name": full_name,
            "company_name": company_name,
            "email": email,
            "phone": phone,
            "service": service,
            "subject": subject,
            "message": message,
        }
