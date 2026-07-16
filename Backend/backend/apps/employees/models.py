from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.common.fields import EncryptedCharField, EncryptedJSONField


class EmployeeProfile(models.Model):
    """
    Model representing detailed employee profile details.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="employee_profile"
    )
    employee_id = models.CharField(max_length=50, unique=True, db_index=True)
    department = models.CharField(max_length=100, db_index=True)
    designation = models.CharField(max_length=100)
    joining_date = models.DateField(db_index=True)
    phone = EncryptedCharField(max_length=255, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = EncryptedCharField(max_length=1000, blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    experience = models.JSONField(default=list, blank=True)
    education = models.JSONField(default=list, blank=True)
    emergency_contact = EncryptedJSONField(default=dict, blank=True)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"


class Attendance(models.Model):
    """
    Tracks daily employee attendance records.
    """

    STATUS_CHOICES = [
        ("Present", "Present"),
        ("Absent", "Absent"),
        ("Half Day", "Half Day"),
        ("Leave", "Leave"),
    ]

    employee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="attendance_records"
    )
    date = models.DateField(db_index=True)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    working_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="Present", db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employee.username} - {self.date}: {self.status}"


class LeaveRequest(models.Model):
    """
    Tracks leave requests and their approval statuses.
    """

    LEAVE_TYPES = [
        ("Casual Leave", "Casual Leave"),
        ("Sick Leave", "Sick Leave"),
        ("Paid Leave", "Paid Leave"),
        ("Emergency Leave", "Emergency Leave"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
        ("Cancelled", "Cancelled"),
    ]

    employee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="leave_requests"
    )
    leave_type = models.CharField(max_length=50, choices=LEAVE_TYPES, db_index=True)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="Pending", db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.employee.username} - {self.leave_type} ({self.status})"


class Project(models.Model):
    """
    Tracks projects and mapped developers/managers.
    """

    STATUS_CHOICES = [
        ("Planning", "Planning"),
        ("Active", "Active"),
        ("Completed", "Completed"),
        ("On Hold", "On Hold"),
    ]

    name = models.CharField(max_length=150, unique=True)
    client = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="Planning", db_index=True
    )
    members = models.ManyToManyField(User, related_name="assigned_projects", blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Task(models.Model):
    """
    SaaS Project Tasks.
    """

    PRIORITIES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
        ("Critical", "Critical"),
    ]

    STATUS_CHOICES = [
        ("Todo", "Todo"),
        ("In Progress", "In Progress"),
        ("Review", "Review"),
        ("Completed", "Completed"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    assigned_employee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="assigned_tasks"
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    priority = models.CharField(
        max_length=20, choices=PRIORITIES, default="Medium", db_index=True
    )
    deadline = models.DateField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="Todo", db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.project.name} - {self.title}"


class TaskComment(models.Model):
    """
    Task discussion comments.
    """

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.user.username} on task {self.task.id}"


class Timesheet(models.Model):
    """
    Weekly timesheet record details.
    """

    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Submitted", "Submitted"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    employee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="timesheet_records"
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="timesheets"
    )
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, null=True, blank=True, related_name="timesheets"
    )
    date = models.DateField(db_index=True)
    hours_worked = models.DecimalField(max_digits=4, decimal_places=2)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="Draft", db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employee.username} - {self.date}: {self.hours_worked} hrs ({self.status})"


class EmployeeDocument(models.Model):
    """
    Official identity and qualification documents.
    """

    DOC_TYPES = [
        ("Resume", "Resume"),
        ("Offer Letter", "Offer Letter"),
        ("NDA", "NDA"),
        ("Certificates", "Certificates"),
        ("Identity Documents", "Identity Documents"),
    ]

    employee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="employee_documents"
    )
    document_type = models.CharField(max_length=50, choices=DOC_TYPES, db_index=True)
    file = models.FileField(upload_to="documents/")
    uploaded_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.employee.username} - {self.document_type}"


class Notification(models.Model):
    """
    System notification logs.
    """

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.title} (Read: {self.is_read})"


class EmployeeSettings(models.Model):
    """
    Settings preferences config.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="employee_settings"
    )
    notification_preferences = models.JSONField(default=dict, blank=True)
    profile_visibility = models.CharField(max_length=20, default="Public")
    account_preferences = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Settings for {self.user.username}"


@receiver(post_save, sender=User)
def auto_create_settings(sender, instance, created, **kwargs):
    if created:
        EmployeeSettings.objects.get_or_create(user=instance)
