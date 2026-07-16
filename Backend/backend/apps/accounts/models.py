from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.common.fields import EncryptedCharField


class UserProfile(models.Model):
    """
    Minimal profile to store user metadata like email verification.
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically creates UserProfile upon new User creation.
    """
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Ensures UserProfile is saved when User object is saved.
    """
    if hasattr(instance, "profile"):
        instance.profile.save()


class Role(models.Model):
    """
    Model representing user roles (e.g. Admin, Recruiter, Client, Guest).
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    permissions = models.ManyToManyField(
        "auth.Permission", blank=True, related_name="custom_roles"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserRole(models.Model):
    """
    Mapping table linking Users to Roles.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_roles")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="user_roles")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "role")

    def __str__(self):
        return f"{self.user.username} - {self.role.name}"


@receiver(post_save, sender=User)
def assign_default_role(sender, instance, created, **kwargs):
    """
    Idempotently assigns the 'Guest' role to new users.
    """
    if created:
        guest_role = Role.objects.filter(name="Guest").first()
        if guest_role:
            UserRole.objects.get_or_create(user=instance, role=guest_role)


class OTPVerification(models.Model):
    """
    OTP verification records for passwords resets, log-ins, and email activations.
    """

    PURPOSE_CHOICES = [
        ("Email Verification", "Email Verification"),
        ("Password Reset", "Password Reset"),
        ("Login Verification", "Login Verification"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps")
    otp_code = models.CharField(max_length=64, db_index=True)  # Stored as SHA-256 hash
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES, db_index=True)
    expiry_time = models.DateTimeField(db_index=True)
    verified_status = models.BooleanField(default=False, db_index=True)
    attempt_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"OTP for {self.user.username} ({self.purpose}) - Verified: {self.verified_status}"


class UserMFA(models.Model):
    """
    MFA TOTP configuration keys and verification states.
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="mfa_config")
    secret_key = EncryptedCharField(max_length=255)  # Enforces encryption at rest
    enabled = models.BooleanField(default=False, db_index=True)
    backup_codes = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"MFA config for {self.user.username} - Enabled: {self.enabled}"

