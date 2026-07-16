from rest_framework import serializers
from apps.newsletter.models import NewsletterSubscription


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ["id", "email", "subscribed_at"]
        read_only_fields = ["id", "subscribed_at"]

    def validate(self, attrs):
        from apps.common.validators import NewsletterValidator
        from django.core.exceptions import ValidationError
        try:
            validated_data = NewsletterValidator.validate(attrs)
        except ValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            )
        return validated_data
