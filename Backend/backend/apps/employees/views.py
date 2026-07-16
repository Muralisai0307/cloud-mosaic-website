from django.http import Http404
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsHR, IsAdmin, IsProjectManager, IsRecruiter, IsOwnerOrAdmin
from apps.common.views import BaseAPIView, BaseViewSet
from apps.common.services.employees_service import EmployeesService
from apps.employees.models import (
    EmployeeProfile,
    Attendance,
    LeaveRequest,
    Project,
    Task,
    TaskComment,
    Timesheet,
    EmployeeDocument,
    Notification,
    EmployeeSettings,
)
from apps.employees.serializers import (
    EmployeeProfileSerializer,
    AttendanceSerializer,
    LeaveRequestSerializer,
    ProjectSerializer,
    TaskSerializer,
    TaskCommentSerializer,
    TimesheetSerializer,
    EmployeeDocumentSerializer,
    NotificationSerializer,
    EmployeeSettingsSerializer,
)


class EmployeeDashboardView(BaseAPIView):
    """
    GET /api/v1/employee/dashboard/
    Retrieves the customized dashboard details for the logged-in employee.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Employee Dashboard Summary",
        description="Gathers profile completion, task counts, attendance history, leave balances, timesheets, and notification status.",
        tags=["Employee Portal"],
        responses={
            200: OpenApiResponse(description="Successful summary payload."),
            401: OpenApiResponse(description="Unauthorized"),
        },
    )
    def get(self, request):
        data = EmployeesService.get_dashboard(request.user)
        return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class EmployeeProfileView(BaseAPIView):
    """
    GET/PUT /api/v1/employees/profile/
    Allows employees to view or update their profile details.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = EmployeeProfileSerializer

    @extend_schema(
        summary="Retrieve Profile Details",
        tags=["Employee Profile"],
        responses={200: EmployeeProfileSerializer},
    )
    def get(self, request):
        profile, created = EmployeeProfile.objects.get_or_create(user=request.user)
        serializer = self.serializer_class(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update Profile Details",
        tags=["Employee Profile"],
        request=EmployeeProfileSerializer,
        responses={200: EmployeeProfileSerializer},
    )
    def put(self, request):
        profile, created = EmployeeProfile.objects.get_or_create(user=request.user)
        serializer = self.serializer_class(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class AttendanceCheckInView(BaseAPIView):
    """
    POST /api/v1/attendance/check-in/
    Checks in the logged-in employee for today.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer

    @extend_schema(
        summary="Employee Check In",
        tags=["Attendance"],
        responses={201: AttendanceSerializer, 400: OpenApiResponse(description="Already checked in.")},
    )
    def post(self, request):
        record = EmployeesService.check_in(request.user)
        serializer = AttendanceSerializer(record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AttendanceCheckOutView(BaseAPIView):
    """
    POST /api/v1/attendance/check-out/
    Checks out the logged-in employee for today.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer

    @extend_schema(
        summary="Employee Check Out",
        tags=["Attendance"],
        responses={200: AttendanceSerializer, 400: OpenApiResponse(description="Not checked in or checked out.")},
    )
    def post(self, request):
        record = EmployeesService.check_out(request.user)
        serializer = AttendanceSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AttendanceHistoryView(BaseAPIView):
    """
    GET /api/v1/attendance/history/
    Retrieves history logs for the current employee.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List Attendance History",
        tags=["Attendance"],
        responses={200: AttendanceSerializer(many=True)},
    )
    def get(self, request):
        records = Attendance.objects.filter(employee=request.user)
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema_view(
    list=extend_schema(summary="List Leave Requests", tags=["Leaves"]),
    retrieve=extend_schema(summary="Retrieve Leave Details", tags=["Leaves"]),
    create=extend_schema(summary="Submit Leave Request", tags=["Leaves"]),
)
class LeaveRequestViewSet(BaseViewSet):
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return LeaveRequest.objects.none()
        # HR managers and Admin can view all requests
        if self.request.user.is_superuser or IsHR().has_permission(self.request, self):
            return LeaveRequest.objects.all()
        return LeaveRequest.objects.filter(employee=self.request.user)

    def perform_create(self, serializer):
        EmployeesService.apply_leave(self.request.user, serializer.validated_data)

    @extend_schema(
        summary="Approve or Reject Leave Request",
        tags=["Leaves"],
        request=None,
        responses={200: LeaveRequestSerializer},
    )
    @action(detail=True, methods=["patch"], url_path="approve")
    def approve(self, request, pk=None):
        if not (request.user.is_superuser or IsHR().has_permission(request, self)):
            return Response({"detail": "Permission Denied."}, status=status.HTTP_403_FORBIDDEN)
        
        status_value = request.data.get("status", "Approved")
        if status_value not in ["Approved", "Rejected"]:
            return Response({"detail": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)
        
        record = EmployeesService.approve_leave(pk, status_value)
        return Response(LeaveRequestSerializer(record).data, status=status.HTTP_200_OK)


@extend_schema_view(
    list=extend_schema(summary="List Timesheet Logs", tags=["Timesheets"]),
    retrieve=extend_schema(summary="Retrieve Timesheet Log", tags=["Timesheets"]),
    create=extend_schema(summary="Submit Timesheet Log", tags=["Timesheets"]),
)
class TimesheetViewSet(BaseViewSet):
    serializer_class = TimesheetSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Timesheet.objects.none()
        # Project Managers and Admin can view all timesheets
        if self.request.user.is_superuser or IsProjectManager().has_permission(self.request, self):
            return Timesheet.objects.all()
        return Timesheet.objects.filter(employee=self.request.user)

    def perform_create(self, serializer):
        EmployeesService.submit_timesheet(self.request.user, serializer.validated_data)

    @extend_schema(
        summary="Approve or Reject Timesheet Log",
        tags=["Timesheets"],
        request=None,
        responses={200: TimesheetSerializer},
    )
    @action(detail=True, methods=["patch"], url_path="approve")
    def approve(self, request, pk=None):
        if not (request.user.is_superuser or IsProjectManager().has_permission(request, self)):
            return Response({"detail": "Permission Denied."}, status=status.HTTP_403_FORBIDDEN)
        
        status_value = request.data.get("status", "Approved")
        if status_value not in ["Approved", "Rejected"]:
            return Response({"detail": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)
        
        record = EmployeesService.approve_timesheet(pk, status_value)
        return Response(TimesheetSerializer(record).data, status=status.HTTP_200_OK)


@extend_schema_view(
    list=extend_schema(summary="List Tasks", tags=["Tasks"]),
    retrieve=extend_schema(summary="Retrieve Task Details", tags=["Tasks"]),
    create=extend_schema(summary="Create Task Posting", tags=["Tasks"]),
    update=extend_schema(summary="Update Task Posting", tags=["Tasks"]),
    destroy=extend_schema(summary="Delete Task Posting", tags=["Tasks"]),
)
class TaskViewSet(BaseViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Task.objects.none()
        # Project Managers can see all tasks, standard developers see only assigned ones
        if self.request.user.is_superuser or IsProjectManager().has_permission(self.request, self):
            return Task.objects.all()
        return Task.objects.filter(assigned_employee=self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsProjectManager()]
        return [IsAuthenticated()]

    @extend_schema(
        summary="Update Task Status",
        tags=["Tasks"],
        request=None,
        responses={200: TaskSerializer},
    )
    @action(detail=True, methods=["patch"], url_path="status")
    def status_update(self, request, pk=None):
        task = self.get_object()
        # Only the assigned developer (or admin/manager) can update status
        if task.assigned_employee != request.user and not request.user.is_superuser:
            return Response({"detail": "Permission Denied."}, status=status.HTTP_403_FORBIDDEN)
        
        status_value = request.data.get("status")
        if status_value not in ["Todo", "In Progress", "Review", "Completed"]:
            return Response({"detail": "Invalid status code."}, status=status.HTTP_400_BAD_REQUEST)
        
        task.status = status_value
        task.save()
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Add Task Discussion Comment",
        tags=["Tasks"],
        request=TaskCommentSerializer,
        responses={201: TaskCommentSerializer},
    )
    @action(detail=True, methods=["post"], url_path="comment")
    def add_comment(self, request, pk=None):
        task = self.get_object()
        serializer = TaskCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(user=request.user, task=task)
        return Response(TaskCommentSerializer(comment).data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    list=extend_schema(summary="List Assigned Projects", tags=["Projects"]),
    retrieve=extend_schema(summary="Retrieve Project Details", tags=["Projects"]),
)
class ProjectViewSet(BaseViewSet):
    serializer_class = ProjectSerializer
    http_method_names = ["get"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Project.objects.none()
        if self.request.user.is_superuser or IsProjectManager().has_permission(self.request, self):
            return Project.objects.all()
        return Project.objects.filter(members=self.request.user)


@extend_schema_view(
    list=extend_schema(summary="List Uploaded Documents", tags=["Documents"]),
    retrieve=extend_schema(summary="Retrieve Document details", tags=["Documents"]),
    create=extend_schema(summary="Upload Document", tags=["Documents"]),
    destroy=extend_schema(summary="Delete Document", tags=["Documents"]),
)
class EmployeeDocumentViewSet(BaseViewSet):
    serializer_class = EmployeeDocumentSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return EmployeeDocument.objects.none()
        if self.request.user.is_superuser or IsAdmin().has_permission(self.request, self):
            return EmployeeDocument.objects.all()
        return EmployeeDocument.objects.filter(employee=self.request.user)

    def get_permissions(self):
        if self.action in ["retrieve", "destroy"]:
            return [IsOwnerOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)


@extend_schema_view(
    list=extend_schema(summary="List Notifications", tags=["Notifications"]),
    retrieve=extend_schema(summary="Retrieve Notification", tags=["Notifications"]),
)
class NotificationViewSet(BaseViewSet):
    serializer_class = NotificationSerializer
    http_method_names = ["get", "patch"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)

    @extend_schema(
        summary="Mark Notification as Read",
        tags=["Notifications"],
        request=None,
        responses={200: NotificationSerializer},
    )
    @action(detail=True, methods=["patch"], url_path="read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)


class EmployeeSettingsView(BaseAPIView):
    """
    GET/PUT /api/v1/settings/
    Retrieves or updates the customized preferences settings configuration.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = EmployeeSettingsSerializer

    @extend_schema(
        summary="Retrieve Settings Preferences",
        tags=["Employee Settings"],
        responses={200: EmployeeSettingsSerializer},
    )
    def get(self, request):
        settings_obj, created = EmployeeSettings.objects.get_or_create(user=request.user)
        serializer = self.serializer_class(settings_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update Settings Preferences",
        tags=["Employee Settings"],
        request=EmployeeSettingsSerializer,
        responses={200: EmployeeSettingsSerializer},
    )
    def put(self, request):
        settings_obj, created = EmployeeSettings.objects.get_or_create(user=request.user)
        serializer = self.serializer_class(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
