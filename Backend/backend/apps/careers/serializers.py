from rest_framework import serializers
from apps.careers.models import Job, JobApplication
from apps.common.validators import validate_phone


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "department",
            "location",
            "description",
            "requirements",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class JobApplicationSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(validators=[validate_phone])

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job",
            "full_name",
            "email",
            "phone",
            "linkedin",
            "portfolio",
            "cover_letter",
            "resume",
            "reference_number",
            "applied_at",
        ]
        read_only_fields = ["id", "reference_number", "applied_at"]

    def validate(self, attrs):
        from apps.common.validators import CareerValidator
        from django.core.exceptions import ValidationError
        try:
            validated_data = CareerValidator.validate(attrs)
        except ValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            )
        return validated_data
