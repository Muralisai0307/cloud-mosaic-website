from django.core.exceptions import ValidationError
from .common_validator import sanitize_string, validate_rating


class TestimonialValidator:
    """
    Validation engine for client testimonials.
    """

    @staticmethod
    def validate(data):
        from apps.testimonials.models import Testimonial
        errors = {}

        # 1. Required fields
        required_fields = ["name", "company", "service", "rating", "review"]
        for field in required_fields:
            val = data.get(field)
            if val is None or str(val).strip() == "":
                errors[field] = "This field is required."

        if errors:
            raise ValidationError(errors)

        # 2. Normalize and sanitize inputs
        name = sanitize_string(data["name"])
        company = sanitize_string(data["company"])
        service = sanitize_string(data["service"])
        review = sanitize_string(data["review"])
        raw_rating = data["rating"]

        # 3. Formats validations
        try:
            rating = validate_rating(raw_rating)
        except ValidationError as e:
            errors["rating"] = list(e.messages)

        # Review length: Min 20, Max 1000
        if len(review) < 20:
            errors["review"] = "Review must be at least 20 characters long."
        elif len(review) > 1000:
            errors["review"] = "Review cannot exceed 1000 characters."

        if errors:
            raise ValidationError(errors)

        # 4. Prevent duplicate testimonials
        is_duplicate = Testimonial.objects.filter(
            name__iexact=name,
            company__iexact=company,
            review__iexact=review,
        ).exists()

        if is_duplicate:
            raise ValidationError(
                {
                    "review": "You have already submitted this exact testimonial."
                }
            )

        return {
            "name": name,
            "company": company,
            "service": service,
            "rating": rating,
            "review": review,
        }
