from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.employees.views import (
    EmployeeDashboardView,
    EmployeeProfileView,
    AttendanceCheckInView,
    AttendanceCheckOutView,
    AttendanceHistoryView,
    LeaveRequestViewSet,
    TimesheetViewSet,
    TaskViewSet,
    ProjectViewSet,
    EmployeeDocumentViewSet,
    NotificationViewSet,
    EmployeeSettingsView,
)

router = DefaultRouter()
router.register("leaves", LeaveRequestViewSet, basename="leave")
router.register("timesheets", TimesheetViewSet, basename="timesheet")
router.register("tasks", TaskViewSet, basename="task")
router.register("projects", ProjectViewSet, basename="project")
router.register("documents", EmployeeDocumentViewSet, basename="document")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    # Dashboard & Profile
    path(
        "employee/dashboard/",
        EmployeeDashboardView.as_view(),
        name="employee-dashboard",
    ),
    path(
        "employees/profile/", EmployeeProfileView.as_view(), name="employee-profile"
    ),
    # Attendance
    path(
        "attendance/check-in/",
        AttendanceCheckInView.as_view(),
        name="attendance-checkin",
    ),
    path(
        "attendance/check-out/",
        AttendanceCheckOutView.as_view(),
        name="attendance-checkout",
    ),
    path(
        "attendance/history/",
        AttendanceHistoryView.as_view(),
        name="attendance-history",
    ),
    # Settings
    path("settings/", EmployeeSettingsView.as_view(), name="employee-settings"),
    # ViewSets (leaves, timesheets, tasks, projects, documents, notifications)
    path("", include(router.urls)),
]
