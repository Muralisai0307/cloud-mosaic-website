import html
import re
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.clients.models import (
    ClientProfile,
    ClientProject,
    ClientDocument,
    Contract,
    Invoice,
    Payment,
    ClientMeeting,
    SupportTicket,
    ClientSettings,
)


def clean_xss(text):
    """
    Sanitizes string inputs to prevent Cross-Site Scripting (XSS).
    """
    if isinstance(text, str):
        return html.escape(text.strip())
    return text


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]

    def validate_phone(self, value):
        if value:
            # Simple digits, space, plus, dash phone validation
            pattern = re.compile(r"^\+?[0-9\s\-]+$")
            if not pattern.match(value):
                raise ValidationError("Invalid phone number format.")
        return value


class ClientProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProject
        fields = "__all__"


class ClientDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientDocument
        fields = "__all__"
        read_only_fields = ["uploaded_by", "uploaded_at"]

    def validate_title(self, value):
        return clean_xss(value)

    def validate(self, attrs):
        # We also perform checks here, but main file checks reside in service layer
        file_obj = attrs.get("file")
        if file_obj:
            if file_obj.size > 10 * 1024 * 1024:
                raise ValidationError({"file": "File size exceeds limit of 10MB."})
            import os
            ext = os.path.splitext(file_obj.name)[1].lower()
            allowed_exts = [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".png", ".jpg", ".jpeg"]
            if ext not in allowed_exts:
                raise ValidationError({"file": f"Unsupported file type '{ext}'."})
        return attrs


class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = "__all__"

    def validate_title(self, value):
        return clean_xss(value)

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        if start_date and end_date and end_date < start_date:
            raise ValidationError({"end_date": "Contract end date cannot reside before the start date."})
        return attrs


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"

    def validate_amount(self, value):
        if value <= 0:
            raise ValidationError("Invoice billing amount must be positive.")
        return value


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["payment_date"]

    def validate_amount(self, value):
        if value <= 0:
            raise ValidationError("Payment transfer amount must be positive.")
        return value


class ClientMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientMeeting
        fields = "__all__"


class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = "__all__"
        read_only_fields = ["client", "created_at", "updated_at"]

    def validate_subject(self, value):
        return clean_xss(value)

    def validate_description(self, value):
        return clean_xss(value)


class ClientSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientSettings
        fields = "__all__"
        read_only_fields = ["client", "created_at", "updated_at"]
