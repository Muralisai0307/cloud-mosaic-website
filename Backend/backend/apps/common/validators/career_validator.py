from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from .common_validator import sanitize_string, validate_email, validate_phone
from .file_validator import FileValidator

resume_validator = FileValidator(
    max_size=5 * 1024 * 1024, allowed_extensions=["pdf", "doc", "docx"]
)


class CareerValidator:
    """
    Validation engine for job listings and application submissions.
    """

    @staticmethod
    def validate(data, files=None):
        from apps.careers.models import Job, JobApplication
        errors = {}

        # 1. Required fields
        required_fields = ["job", "full_name", "email", "phone"]
        for field in required_fields:
            val = data.get(field)
            if val is None or str(val).strip() == "":
                errors[field] = "This field is required."

        # Fetch resume file from data or files dict
        resume_file = None
        if files and "resume" in files:
            resume_file = files["resume"]
        elif data.get("resume"):
            resume_file = data["resume"]

        if not resume_file:
            errors["resume"] = "Resume file upload is required."

        if errors:
            raise ValidationError(errors)

        # 2. Retrieve and validate Job instance
        job_val = data.get("job")
        if isinstance(job_val, Job):
            job = job_val
        else:
            try:
                job = Job.objects.get(id=job_val)
            except (Job.DoesNotExist, ValueError, TypeError):
                errors["job"] = "Specified job position does not exist."
                raise ValidationError(errors)

        if not job.is_active:
            errors["job"] = "Applications are closed for this job position."
            raise ValidationError(errors)

        # 3. Normalize and sanitize inputs
        email = sanitize_string(data["email"])
        phone = sanitize_string(data["phone"])
        full_name = sanitize_string(data["full_name"])
        cover_letter = sanitize_string(data.get("cover_letter", ""))
        linkedin = data.get("linkedin")
        portfolio = data.get("portfolio")

        # 4. Validations
        try:
            email = validate_email(email)
        except ValidationError as e:
            errors["email"] = list(e.messages)

        try:
            phone = validate_phone(phone)
        except ValidationError as e:
            errors["phone"] = list(e.messages)

        # URL validates
        url_validator = URLValidator()
        if linkedin:
            try:
                url_validator(linkedin)
            except ValidationError:
                errors["linkedin"] = "Enter a valid LinkedIn URL."
        if portfolio:
            try:
                url_validator(portfolio)
            except ValidationError:
                errors["portfolio"] = "Enter a valid Portfolio URL."

        # Resume file validations
        try:
            resume_validator(resume_file)
        except ValidationError as e:
            errors["resume"] = list(e.messages)

        if errors:
            raise ValidationError(errors)

        # 5. Prevent duplicate applications (same candidate email for same job)
        has_already_applied = JobApplication.objects.filter(
            job=job, email__iexact=email
        ).exists()

        if has_already_applied:
            raise ValidationError(
                {
                    "email": "You have already submitted an application for this job position."
                }
            )

        return {
            "job": job,
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "linkedin": linkedin,
            "portfolio": portfolio,
            "cover_letter": cover_letter,
            "resume": resume_file,
        }
