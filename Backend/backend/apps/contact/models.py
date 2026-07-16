from django.db import models
from apps.common.validators import validate_phone


class ContactMessage(models.Model):
    full_name = models.CharField(max_length=100)
    company_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=20, validators=[validate_phone], db_index=True)
    service = models.CharField(max_length=100)
    subject = models.CharField(max_length=150)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Message from {self.full_name} - {self.subject}"
