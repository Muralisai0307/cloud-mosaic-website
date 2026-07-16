from rest_framework import serializers
from apps.contact.models import ContactMessage
from apps.common.validators import validate_phone


class ContactSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(validators=[validate_phone])

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "full_name",
            "company_name",
            "email",
            "phone",
            "service",
            "subject",
            "message",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
    def validate(self, attrs):
        from apps.common.validators import ContactValidator
        from django.core.exceptions import ValidationError
        try:
            # Delegate to centralized validator layer
            validated_data = ContactValidator.validate(attrs)
        except ValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            )
        return validated_data
