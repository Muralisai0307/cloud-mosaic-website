from rest_framework import serializers
from apps.meetings.models import MeetingBooking
from apps.common.validators import validate_phone, validate_future_date


class MeetingBookingSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(validators=[validate_phone])
    meeting_date = serializers.DateField(validators=[validate_future_date])

    class Meta:
        model = MeetingBooking
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "company",
            "service",
            "meeting_date",
            "meeting_time",
            "message",
            "reference_number",
            "created_at",
        ]
        read_only_fields = ["id", "reference_number", "created_at"]

    def validate(self, attrs):
        from apps.common.validators import MeetingValidator
        from django.core.exceptions import ValidationError
        try:
            validated_data = MeetingValidator.validate(attrs)
        except ValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            )
        return validated_data
