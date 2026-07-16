import logging
from django.db import transaction
from apps.careers.models import Job, JobApplication
from apps.common.services.email_service import EmailService
from apps.common.validators import generate_reference_number

logger = logging.getLogger("apps.services.careers")


class CareersService:
    """
    Handles business logic processes for job listings and application submissions.
    """

    @staticmethod
    def get_active_jobs():
        logger.info("Request received: Fetching active job positions")
        jobs = Job.objects.filter(is_active=True).order_by("-created_at")
        logger.info(f"Business logic executed: Found {jobs.count()} active jobs")
        return jobs

    @staticmethod
    def apply_to_job(data, resume_file=None):
        logger.info("Request received: Job application submission")
        logger.info("Validation passed: Job application details")

        # Generate a unique reference number
        ref_number = generate_reference_number("APP")

        # Save in transaction block
        with transaction.atomic():
            application = JobApplication.objects.create(
                job=data.get("job"),
                full_name=data.get("full_name"),
                email=data.get("email"),
                phone=data.get("phone"),
                linkedin=data.get("linkedin"),
                portfolio=data.get("portfolio"),
                cover_letter=data.get("cover_letter", ""),
                resume=resume_file or data.get("resume"),
                reference_number=ref_number,
            )
            logger.info(f"Database saved: JobApplication ID {application.id}")

        # Notify recruiter and confirm candidate
        EmailService.send_application_confirmation(application)
        EmailService.send_recruiter_notification(application)

        return application

    @staticmethod
    def create_job(serializer):
        logger.info("Request received: Creating a new job listing")
        job = serializer.save()
        logger.info(f"Database saved: Job ID {job.id}")
        return job

    @staticmethod
    def update_job(serializer):
        logger.info(f"Request received: Updating job listing {serializer.instance.id}")
        job = serializer.save()
        logger.info(f"Database saved: Updated Job ID {job.id}")
        return job

    @staticmethod
    def delete_job(instance):
        logger.info(f"Request received: Deleting job listing {instance.id}")
        instance_id = instance.id
        instance.delete()
        logger.info(f"Database deleted: Job ID {instance_id}")

    @staticmethod
    def get_all_applications():
        logger.info("Request received: Fetching all job applications")
        return JobApplication.objects.all().order_by("-applied_at")
