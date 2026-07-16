import re
import html
import random
import datetime
from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email


class ValidationService:
    """
    Centralizes sanitization, validation, normalization, and reference generation.
    """

    @staticmethod
    def normalize_email(email):
        if not email:
            return email
        return email.lower().strip()

    @staticmethod
    def normalize_phone(phone):
        if not phone:
            return phone
        # Remove common spaces, dashes, parentheses formatting characters
        return re.sub(r"[\s\-()]+", "", phone).strip()

    @staticmethod
    def sanitize_text(text):
        if not text:
            return text
        # Escape HTML entities to prevent script injection vulnerabilities
        return html.escape(text.strip())

    @staticmethod
    def generate_reference_number(prefix):
        date_str = datetime.date.today().strftime("%Y%m%d")
        random_suffix = random.randint(1000, 9999)
        return f"{prefix}-{date_str}-{random_suffix}"

    @staticmethod
    def validate_email(value):
        try:
            django_validate_email(value)
        except ValidationError:
            raise ValidationError("Enter a valid email address.")
        return value

    @staticmethod
    def validate_phone(value):
        phone_regex = re.compile(
            r"^\+?1?[ -]?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}$|^\+?\d{7,15}$"
        )
        if not phone_regex.match(value):
            raise ValidationError(
                "Enter a valid phone number (e.g. +1234567890 or 123-456-7890)."
            )
        return value

    @staticmethod
    def validate_meeting_date(value):
        if value < datetime.date.today():
            raise ValidationError("The scheduled date cannot be in the past.")
        return value

    @staticmethod
    def validate_rating(value):
        try:
            val = int(value)
            if val < 1 or val > 5:
                raise ValueError()
        except (ValueError, TypeError):
            raise ValidationError("Rating must be an integer between 1 and 5.")
        return val

    @staticmethod
    def validate_resume(value):
        # Validate size: Max 5MB
        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise ValidationError("File size exceeds the maximum limit of 5MB.")

        # Validate extension
        allowed_extensions = ["pdf", "doc", "docx"]
        ext = value.name.split(".")[-1].lower()
        if ext not in allowed_extensions:
            raise ValidationError(
                "Unsupported file extension. Allowed formats are: PDF, DOC, DOCX."
            )
        return value
