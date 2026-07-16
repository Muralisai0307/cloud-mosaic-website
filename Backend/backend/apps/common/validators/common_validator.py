import re
import datetime
from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email


def validate_email(value):
    if not value:
        raise ValidationError("Email is required.")
    try:
        django_validate_email(value.strip())
    except ValidationError:
        raise ValidationError("Enter a valid email address.")
    return value.strip().lower()


def validate_phone(value):
    if not value:
        raise ValidationError("Phone number is required.")

    # Remove formatting characters to inspect only numbers
    cleaned = re.sub(r"[\s\-()]+", "", value).strip()
    phone_regex = re.compile(r"^\+?\d{7,15}$")
    if not phone_regex.match(cleaned):
        raise ValidationError(
            "Enter a valid phone number (e.g. +1234567890 or 123-456-7890)."
        )
    return value.strip()


def validate_future_date(value):
    if not value:
        raise ValidationError("Date is required.")
    if isinstance(value, str):
        try:
            value = datetime.datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            raise ValidationError("Enter a valid date in YYYY-MM-DD format.")

    if value < datetime.date.today():
        raise ValidationError("The scheduled date cannot be in the past.")
    return value


def remove_emojis(value):
    if not value:
        return value
    # Regex matching emoji and surrogate ranges
    emoji_pattern = re.compile("[\U00010000-\U0010ffff]+", flags=re.UNICODE)
    return emoji_pattern.sub(r"", value)


def check_xss(value):
    if not value:
        return value
    # Detect common XSS vectors
    xss_patterns = [
        r"<script.*?>",
        r"javascript:",
        r"<iframe.*?>",
        r"onload\s*=",
        r"onerror\s*=",
        r"onmouseover\s*=",
    ]
    for pattern in xss_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            raise ValidationError(
                "Potential cross-site scripting (XSS) input detected."
            )
    return value


def check_sqli(value):
    if not value:
        return value
    # Detect common SQL Injection patterns (case-insensitive keyword sequences)
    sqli_patterns = [
        r"\bselect\s+\*\s+from\b",
        r"\bdrop\s+table\b",
        r"\bdelete\s+from\b",
        r"\binsert\s+into\b",
        r"\bupdate\s+\w+\s+set\b",
        r"\bunion\s+select\b",
        r"--",
        r"\/\*.*?\*\/",
    ]
    for pattern in sqli_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            raise ValidationError("Potential SQL Injection input detected.")
    return value


def sanitize_string(value, strip_emojis=True):
    if not value:
        return ""
    val = value.strip()
    # Check for security issues
    check_xss(val)
    check_sqli(val)
    if strip_emojis:
        val = remove_emojis(val)
    return val


def validate_rating(value):
    try:
        val = int(value)
        if val < 1 or val > 5:
            raise ValueError()
    except (ValueError, TypeError):
        raise ValidationError("Rating must be an integer between 1 and 5.")
    return val


def generate_reference_number(prefix):
    import random
    date_str = datetime.date.today().strftime("%Y%m%d")
    random_suffix = random.randint(1000, 9999)
    return f"{prefix}-{date_str}-{random_suffix}"
