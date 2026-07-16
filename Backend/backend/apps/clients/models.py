from django.db import models
from django.contrib.auth.models import User
from apps.common.fields import EncryptedCharField


class ClientProfile(models.Model):
    """
    Model storing client company profile and contact details.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="client_profile"
    )
    company_name = models.CharField(max_length=255)
    company_email = models.EmailField(unique=True, db_index=True)
    phone = EncryptedCharField(max_length=255, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=100, db_index=True)
    company_size = models.CharField(max_length=50, blank=True, null=True)
    address = EncryptedCharField(max_length=1000, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name


class ClientProject(models.Model):
    """
    Model representing client-visible projects.
    """

    STATUS_CHOICES = [
        ("Planning", "Planning"),
        ("Active", "Active"),
        ("On Hold", "On Hold"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="projects", db_index=True
    )
    project_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="Planning", db_index=True
    )

    def __str__(self):
        return f"{self.project_name} ({self.client.company_name})"


class ClientDocument(models.Model):
    """
    Model managing files and documents shared with or uploaded by clients.
    """

    TYPE_CHOICES = [
        ("Contract", "Contract"),
        ("Proposal", "Proposal"),
        ("Requirement Document", "Requirement Document"),
        ("Invoice", "Invoice"),
        ("Report", "Report"),
        ("Other", "Other"),
    ]

    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="documents"
    )
    project = models.ForeignKey(
        ClientProject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    file = models.FileField(upload_to="client_docs/")
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_visible = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class Contract(models.Model):
    """
    Model managing contracts and formal agreements.
    """

    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Sent", "Sent"),
        ("Signed", "Signed"),
        ("Expired", "Expired"),
        ("Cancelled", "Cancelled"),
    ]

    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="contracts"
    )
    project = models.ForeignKey(
        ClientProject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contracts",
    )
    contract_number = models.CharField(max_length=100, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    contract_value = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="Draft", db_index=True
    )

    def __str__(self):
        return f"{self.title} ({self.contract_number})"


class Invoice(models.Model):
    """
    Model managing billing invoices.
    """

    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Sent", "Sent"),
        ("Paid", "Paid"),
        ("Pending", "Pending"),
        ("Overdue", "Overdue"),
        ("Cancelled", "Cancelled"),
    ]

    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="invoices"
    )
    project = models.ForeignKey(
        ClientProject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    invoice_number = models.CharField(max_length=100, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="Draft", db_index=True
    )

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.client.company_name}"


class Payment(models.Model):
    """
    Model storing payment transaction logs.
    """

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Completed", "Completed"),
        ("Failed", "Failed"),
        ("Refunded", "Refunded"),
    ]

    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name="payments"
    )
    payment_reference = models.CharField(max_length=100, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_method = models.CharField(max_length=100)
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="Pending", db_index=True
    )

    def __str__(self):
        return f"Payment {self.payment_reference} for {self.invoice.invoice_number}"


class ClientMeeting(models.Model):
    """
    Model tracking meeting bookings with client contacts.
    """

    STATUS_CHOICES = [
        ("Scheduled", "Scheduled"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="meetings"
    )
    title = models.CharField(max_length=255)
    meeting_date = models.DateField()
    meeting_time = models.TimeField()
    meeting_link = models.URLField(max_length=500)
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="Scheduled", db_index=True
    )

    def __str__(self):
        return f"Meeting: {self.title} on {self.meeting_date}"


class SupportTicket(models.Model):
    """
    Model managing client-submitted support/inquiry tickets.
    """

    PRIORITY_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
        ("Critical", "Critical"),
    ]

    STATUS_CHOICES = [
        ("Open", "Open"),
        ("In Progress", "In Progress"),
        ("Resolved", "Resolved"),
        ("Closed", "Closed"),
    ]

    client = models.ForeignKey(
        ClientProfile, on_delete=models.CASCADE, related_name="tickets"
    )
    subject = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(
        max_length=50, choices=PRIORITY_CHOICES, default="Medium", db_index=True
    )
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="Open", db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket #{self.id}: {self.subject} ({self.client.company_name})"


class ClientSettings(models.Model):
    """
    Model managing preferences configuration.
    """

    client = models.OneToOneField(
        ClientProfile, on_delete=models.CASCADE, related_name="settings"
    )
    notification_email = models.BooleanField(default=True)
    notification_sms = models.BooleanField(default=False)
    timezone = models.CharField(max_length=100, default="UTC")
    language = models.CharField(max_length=10, default="en")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.client.company_name}"
