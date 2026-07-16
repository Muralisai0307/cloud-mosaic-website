import datetime
from django.core.exceptions import ValidationError
from .common_validator import (
    sanitize_string,
    validate_email,
    validate_phone,
    validate_future_date,
)


class MeetingValidator:
    """
    Validation engine for meeting booking requests.
    """

    @staticmethod
    def validate(data):
        from apps.meetings.models import MeetingBooking
        errors = {}

        # 1. Required fields
        required_fields = [
            "full_name",
            "email",
            "phone",
            "service",
            "meeting_date",
            "meeting_time",
        ]
        for field in required_fields:
            val = data.get(field)
            if val is None or str(val).strip() == "":
                errors[field] = "This field is required."

        if errors:
            raise ValidationError(errors)

        # 2. Normalize and sanitize inputs
        email = sanitize_string(data["email"])
        phone = sanitize_string(data["phone"])
        full_name = sanitize_string(data["full_name"])
        company = sanitize_string(data.get("company", ""))
        service = sanitize_string(data["service"])
        message = sanitize_string(data.get("message", ""))
        meeting_date = data["meeting_date"]
        meeting_time = data["meeting_time"]

        # 3. Formats validations
        try:
            email = validate_email(email)
        except ValidationError as e:
            errors["email"] = list(e.messages)

        try:
            phone = validate_phone(phone)
        except ValidationError as e:
            errors["phone"] = list(e.messages)

        try:
            meeting_date = validate_future_date(meeting_date)
        except ValidationError as e:
            errors["meeting_date"] = list(e.messages)

        # Time range validation (09:00 AM to 06:00 PM)
        parsed_time = None
        if meeting_time:
            if isinstance(meeting_time, str):
                try:
                    parts = meeting_time.split(":")
                    if len(parts) == 2:
                        parsed_time = datetime.datetime.strptime(
                            meeting_time, "%H:%M"
                        ).time()
                    else:
                        parsed_time = datetime.datetime.strptime(
                            meeting_time, "%H:%M:%S"
                        ).time()
                except ValueError:
                    errors["meeting_time"] = (
                        "Enter a valid time in HH:MM format."
                    )
            else:
                parsed_time = meeting_time

            if parsed_time:
                start_time = datetime.time(9, 0)
                end_time = datetime.time(18, 0)
                if parsed_time < start_time or parsed_time > end_time:
                    errors["meeting_time"] = (
                        "Meetings can only be scheduled during business hours (09:00 AM to 06:00 PM)."
                    )

        if errors:
            raise ValidationError(errors)

        # 4. Prevent double booking on exact date + time
        is_slot_taken = MeetingBooking.objects.filter(
            meeting_date=meeting_date, meeting_time=parsed_time
        ).exists()

        if is_slot_taken:
            errors["meeting_time"] = (
                "This time slot has already been booked. Please select another time."
            )

        # 5. Limit client bookings to one per day
        has_meeting_on_day = MeetingBooking.objects.filter(
            email__iexact=email, meeting_date=meeting_date
        ).exists()

        if has_meeting_on_day:
            errors["email"] = (
                "You have already scheduled a meeting for this day. Only one booking per client per day is allowed."
            )

        if errors:
            raise ValidationError(errors)

        return {
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "company": company,
            "service": service,
            "meeting_date": meeting_date,
            "meeting_time": parsed_time,
            "message": message,
        }
