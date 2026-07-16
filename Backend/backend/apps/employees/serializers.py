from rest_framework import serializers

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


class EmployeeProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True, required=False)
    email = serializers.CharField(source="user.email", read_only=True, required=False)

    class Meta:
        model = EmployeeProfile
        fields = [
            "id",
            "username",
            "email",
            "employee_id",
            "department",
            "designation",
            "joining_date",
            "phone",
            "date_of_birth",
            "address",
            "skills",
            "experience",
            "education",
            "emergency_contact",
            "profile_image",
        ]
        read_only_fields = ["employee_id", "joining_date"]


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ["employee", "working_hours"]


class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = "__all__"
        read_only_fields = ["employee", "status"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    assigned_name = serializers.CharField(source="assigned_employee.username", read_only=True)

    class Meta:
        model = Task
        fields = "__all__"


class TaskCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = TaskComment
        fields = "__all__"
        read_only_fields = ["user", "task"]


class TimesheetSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    task_name = serializers.CharField(source="task.title", read_only=True, allow_null=True)

    class Meta:
        model = Timesheet
        fields = "__all__"
        read_only_fields = ["employee", "status"]

    def validate_hours_worked(self, value):
        if value <= 0:
            raise serializers.ValidationError("Working hours must be positive.")
        if value > 24:
            raise serializers.ValidationError("Working hours cannot exceed 24 hours in a single day.")
        return value


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = "__all__"
        read_only_fields = ["employee"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ["user", "title", "message", "created_at"]


class EmployeeSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeSettings
        fields = "__all__"
        read_only_fields = ["user"]
