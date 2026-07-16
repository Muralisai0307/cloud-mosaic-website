from django.db import models
from apps.common.validators import validate_phone, validate_future_date


class MeetingBooking(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=20, validators=[validate_phone], db_index=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    service = models.CharField(max_length=100)
    meeting_date = models.DateField(validators=[validate_future_date], db_index=True)
    meeting_time = models.TimeField(db_index=True)
    message = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-meeting_date", "-meeting_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["meeting_date", "meeting_time"],
                name="unique_meeting_booking"
            )
        ]

    def __str__(self):
        return f"Meeting with {self.full_name} on {self.meeting_date} at {self.meeting_time}"
