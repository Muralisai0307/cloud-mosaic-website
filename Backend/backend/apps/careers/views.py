from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsHR, IsRecruiter
from apps.careers.models import Job, JobApplication
from apps.careers.serializers import JobApplicationSerializer, JobSerializer
from apps.common.services.careers_service import CareersService
from apps.common.views import BaseAPIView, BaseViewSet


@extend_schema_view(
    list=extend_schema(
        summary="List Active Job Positions",
        description="Retrieves a list of all active job postings. Supports searching (on title, description, requirements), filtering (on department and location), and ordering.",
        tags=["Careers"],
    ),
    retrieve=extend_schema(
        summary="Retrieve Job Details",
        description="Retrieves the detailed specifications and requirements for a single active job listing by its database ID.",
        tags=["Careers"],
    ),
    create=extend_schema(
        summary="Create Job Posting",
        description="Allows HR managers to publish a new job position. Restricted to HR.",
        tags=["Careers"],
    ),
    update=extend_schema(
        summary="Update Job Posting",
        description="Allows HR managers to modify a job position details. Restricted to HR.",
        tags=["Careers"],
    ),
    partial_update=extend_schema(
        summary="Partially Update Job Posting",
        description="Allows HR managers to partially modify a job position details. Restricted to HR.",
        tags=["Careers"],
    ),
    destroy=extend_schema(
        summary="Delete Job Posting",
        description="Allows HR managers to archive/remove a job position. Restricted to HR.",
        tags=["Careers"],
    ),
)
class JobViewSet(BaseViewSet):
    """
    ViewSet for jobs management.
    """

    serializer_class = JobSerializer
    queryset = Job.objects.all()

    # Enable filter, search, and ordering backends
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["department", "location"]
    search_fields = ["title", "description", "requirements"]
    ordering_fields = ["created_at", "title"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsHR()]
        return [AllowAny()]

    def get_queryset(self):
        # HR managers can view all jobs (active or inactive)
        if self.action in ["create", "update", "partial_update", "destroy"] or (
            self.request.user and self.request.user.is_authenticated and IsHR().has_permission(self.request, self)
        ):
            return Job.objects.all().order_by("-created_at")
        return CareersService.get_active_jobs()

    def perform_create(self, serializer):
        CareersService.create_job(serializer)

    def perform_update(self, serializer):
        CareersService.update_job(serializer)

    def perform_destroy(self, instance):
        CareersService.delete_job(instance)


class JobApplicationCreateView(BaseAPIView):
    """
    API View to submit a job application. Supports PDF/DOC/DOCX resume file upload.
    Also handles applications fetching for Recruiter role.
    """

    parser_classes = [MultiPartParser, FormParser]
    serializer_class = JobApplicationSerializer
    success_message = "Your job application has been submitted successfully."

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsRecruiter()]
        return [AllowAny()]

    @extend_schema(
        summary="Submit Job Application",
        description="Submits a job application for a specific active job position. Validates applicant details, checks duplicate application limits, checks resume size (up to 5MB) and content formats, and saves the resume securely.",
        tags=["Careers"],
        responses={
            201: OpenApiResponse(
                response=JobApplicationSerializer,
                description="Application submitted successfully.",
            ),
            400: OpenApiResponse(
                description="Validation Failure (invalid resume file, duplicate submission, inactive job position)."
            ),
            500: OpenApiResponse(description="Internal Server Error"),
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = JobApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Delegate business logic processing to the service layer
        application = CareersService.apply_to_job(
            serializer.validated_data, request.FILES.get("resume")
        )

        # Serialize saved instance for response
        response_serializer = JobApplicationSerializer(application)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="List Job Applications",
        description="Retrieves a list of all job applications. Restricted to Recruiters.",
        tags=["Careers"],
        responses={
            200: OpenApiResponse(
                response=JobApplicationSerializer(many=True),
                description="List of job applications.",
            ),
            401: OpenApiResponse(description="Unauthorized"),
            403: OpenApiResponse(description="Forbidden"),
        },
    )
    def get(self, request, *args, **kwargs):
        applications = CareersService.get_all_applications()
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
