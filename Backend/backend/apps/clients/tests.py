import datetime
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Role, UserRole
from apps.clients.models import (
    ClientProfile,
    ClientProject,
    ClientDocument,
    Contract,
    Invoice,
    SupportTicket,
)

User = get_user_model()


class ClientPortalTestCase(APITestCase):
    """
    Test suite covering client authentication, profile management, project access isolation,
    document uploading rules, invoices access control, and support ticketing.
    """

    def setUp(self):
        # Setup roles
        self.client_role, _ = Role.objects.get_or_create(name="Client")
        self.finance_role, _ = Role.objects.get_or_create(name="Finance Manager")
        self.admin_role, _ = Role.objects.get_or_create(name="Admin")

        # Setup Client A
        self.user_a = User.objects.create_user(
            username="client_a", email="client_a@company.com", password="Password123!"
        )
        UserRole.objects.create(user=self.user_a, role=self.client_role)
        self.profile_a = ClientProfile.objects.create(
            user=self.user_a,
            company_name="Company A",
            company_email="info@companya.com",
            phone="+15550101",
            industry="Software",
        )

        # Setup Client B
        self.user_b = User.objects.create_user(
            username="client_b", email="client_b@company.com", password="Password123!"
        )
        UserRole.objects.create(user=self.user_b, role=self.client_role)
        self.profile_b = ClientProfile.objects.create(
            user=self.user_b,
            company_name="Company B",
            company_email="info@companyb.com",
            phone="+15550102",
            industry="Finance",
        )

        # Setup Finance User
        self.finance_user = User.objects.create_user(
            username="finance_officer", email="finance@cloudmosaic.com", password="Password123!"
        )
        UserRole.objects.create(user=self.finance_user, role=self.finance_role)

        # Setup project for Client A
        self.proj_a = ClientProject.objects.create(
            client=self.profile_a,
            project_name="A's Project",
            start_date=datetime.date.today(),
            status="Active",
        )

        # Setup project for Client B
        self.proj_b = ClientProject.objects.create(
            client=self.profile_b,
            project_name="B's Project",
            start_date=datetime.date.today(),
            status="Active",
        )

    def test_client_login_success(self):
        login_url = reverse("auth_login")
        response = self.client.post(
            login_url, {"username": "client_a", "password": "Password123!"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data["data"])

    def test_client_profile_access(self):
        self.client.force_authenticate(user=self.user_a)
        profile_url = reverse("client_profile")
        
        # Get profile
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["company_name"], "Company A")

        # Edit profile
        response = self.client.put(profile_url, {"company_name": "Company A Updated"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["company_name"], "Company A Updated")

    def test_project_access_isolation(self):
        # Authenticate as Client A
        self.client.force_authenticate(user=self.user_a)
        
        # Should view A's project
        response = self.client.get(reverse("client_projects-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["project_name"], "A's Project")

        # Accessing B's project directly should return 403 Forbidden
        detail_url = reverse("client_projects-detail", args=[self.proj_b.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_document_upload_validation(self):
        self.client.force_authenticate(user=self.user_a)
        upload_url = reverse("client_documents-list")

        # 1. Invalid file format
        bad_file = SimpleUploadedFile("script.py", b"print('hacked')", content_type="text/plain")
        response = self.client.post(
            upload_url,
            {"title": "Exploit Script", "document_type": "Other", "file": bad_file},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)

        # 2. Valid file format but too large
        large_file = SimpleUploadedFile("report.pdf", b"0" * (11 * 1024 * 1024), content_type="application/pdf")
        response = self.client.post(
            upload_url,
            {"title": "Huge Report", "document_type": "Report", "file": large_file},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invoices_access_isolation(self):
        invoice_a = Invoice.objects.create(
            client=self.profile_a,
            project=self.proj_a,
            invoice_number="INV-A-001",
            amount=5000.00,
            due_date=datetime.date.today() + datetime.timedelta(days=10),
            status="Sent",
        )
        
        invoice_b = Invoice.objects.create(
            client=self.profile_b,
            project=self.proj_b,
            invoice_number="INV-B-001",
            amount=6000.00,
            due_date=datetime.date.today() + datetime.timedelta(days=10),
            status="Sent",
        )

        # Client A cannot access Client B's invoice
        self.client.force_authenticate(user=self.user_a)
        detail_url = reverse("client_invoices-detail", args=[invoice_b.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Finance user can access Client B's invoice
        self.client.force_authenticate(user=self.finance_user)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ticket_creation_and_xss_protection(self):
        self.client.force_authenticate(user=self.user_a)
        ticket_url = reverse("client_support-list")

        response = self.client.post(
            ticket_url,
            {
                "subject": "<script>alert('XSS')</script> Subject",
                "description": "I need help with my login.",
                "priority": "Medium",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check that HTML entities are escaped to prevent XSS injection
        self.assertNotIn("<script>", response.data["subject"])
        self.assertIn("&lt;script&gt;", response.data["subject"])
