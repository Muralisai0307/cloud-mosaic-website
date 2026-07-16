import datetime
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Role, UserRole
from apps.employees.models import Attendance, LeaveRequest, Project, Task, Timesheet


class EmployeePortalTests(APITestCase):
    def setUp(self):
        # Create default roles
        self.dev_role, _ = Role.objects.get_or_create(name="Developer")
        self.hr_role, _ = Role.objects.get_or_create(name="HR Manager")

        # Create developer user
        self.dev_user = User.objects.create_user(
            username="devtest", email="devtest@test.com", password="password"
        )
        UserRole.objects.get_or_create(user=self.dev_user, role=self.dev_role)

        # Create HR user
        self.hr_user = User.objects.create_user(
            username="hrtest", email="hrtest@test.com", password="password"
        )
        UserRole.objects.get_or_create(user=self.hr_user, role=self.hr_role)

        # Log in dev_user by default
        self.client.force_authenticate(user=self.dev_user)

        # Create mock project and task
        self.project = Project.objects.create(
            name="Test SaaS Project",
            client="Test Client",
            start_date=datetime.date.today(),
            status="Active",
        )
        self.project.members.add(self.dev_user)

        self.task = Task.objects.create(
            title="Configure Security Groups",
            description="Testing standard security policies.",
            assigned_employee=self.dev_user,
            project=self.project,
            priority="Medium",
            deadline=datetime.date.today() + datetime.timedelta(days=2),
            status="Todo",
        )

    def test_dashboard_endpoint(self):
        url = reverse("employee-dashboard")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(
            response.data["data"]["employee_name"], "devtest"
        )

    def test_attendance_checkin_checkout_flow(self):
        # 1. Success checkin
        checkin_url = reverse("attendance-checkin")
        response = self.client.post(checkin_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "Present")

        # 2. Block double checkin
        response_dup = self.client.post(checkin_url)
        self.assertEqual(response_dup.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Success checkout
        checkout_url = reverse("attendance-checkout")
        response_out = self.client.post(checkout_url)
        self.assertEqual(response_out.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response_out.data["check_out"])
        self.assertEqual(
            Attendance.objects.filter(employee=self.dev_user).count(), 1
        )

    def test_leave_request_submission_and_hr_approval(self):
        # 1. Submit leave
        leave_url = reverse("leave-list")
        payload = {
            "leave_type": "Sick Leave",
            "start_date": str(datetime.date.today()),
            "end_date": str(datetime.date.today() + datetime.timedelta(days=1)),
            "reason": "Feeling under the weather.",
        }
        response = self.client.post(leave_url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Approve leave as HR Manager
        self.client.force_authenticate(user=self.hr_user)
        req_id = LeaveRequest.objects.first().id
        approve_url = reverse("leave-approve", kwargs={"pk": req_id})
        response_app = self.client.patch(approve_url, data={"status": "Approved"})
        self.assertEqual(response_app.status_code, status.HTTP_200_OK)
        self.assertEqual(response_app.data["status"], "Approved")

    def test_timesheet_hours_validation(self):
        timesheet_url = reverse("timesheet-list")
        # Hours worked validation: negative hours
        payload = {
            "project": self.project.id,
            "task": self.task.id,
            "date": str(datetime.date.today()),
            "hours_worked": -2.5,
            "description": "Debugging backend issues.",
        }
        response = self.client.post(timesheet_url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
