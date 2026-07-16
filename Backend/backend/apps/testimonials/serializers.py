from rest_framework import serializers
from apps.testimonials.models import Testimonial


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ["id", "name", "company", "service", "rating", "review", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    def validate(self, attrs):
        from apps.common.validators import TestimonialValidator
        from django.core.exceptions import ValidationError
        try:
            validated_data = TestimonialValidator.validate(attrs)
        except ValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            )
        return validated_data
