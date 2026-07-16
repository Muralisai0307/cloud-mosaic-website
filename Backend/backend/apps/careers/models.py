from django.db import models
from apps.common.validators import validate_phone, FileValidator

# Resume validator for PDF, DOC, DOCX formats and maximum 5MB size
resume_validator = FileValidator(
    max_size=5 * 1024 * 1024, allowed_extensions=["pdf", "doc", "docx"]
)


class Job(models.Model):
    title = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.location} ({self.department})"


class JobApplication(models.Model):
    job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="applications"
    )
    full_name = models.CharField(max_length=100)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=20, validators=[validate_phone], db_index=True)
    linkedin = models.URLField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)
    cover_letter = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    resume = models.FileField(upload_to="resumes/", validators=[resume_validator])
    applied_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-applied_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["job", "email"], name="unique_job_application"
            )
        ]

    def __str__(self):
        return f"Application by {self.full_name} for {self.job.title}"
