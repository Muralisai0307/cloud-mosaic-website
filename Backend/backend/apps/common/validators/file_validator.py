import os
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


@deconstructible
class FileValidator:
    """
    Validates uploaded file types, sizes, extensions, and blocks executable formats.
    """

    def __init__(self, max_size=5 * 1024 * 1024, allowed_extensions=None):
        self.max_size = max_size
        self.allowed_extensions = allowed_extensions or ["pdf", "doc", "docx"]
        self.blocked_extensions = [
            "exe",
            "bat",
            "sh",
            "cmd",
            "msi",
            "com",
            "vbs",
            "scr",
            "pif",
            "js",
            "bin",
        ]

    def __call__(self, value):
        # 1. Enforce size constraint
        if self.max_size and value.size > self.max_size:
            max_size_mb = self.max_size / (1024 * 1024)
            raise ValidationError(
                f"File size exceeds the maximum limit of {max_size_mb:.1f}MB."
            )

        # 2. Extract and inspect extension
        ext = os.path.splitext(value.name)[1][1:].lower()

        # Reject known executable extensions
        if ext in self.blocked_extensions:
            raise ValidationError("Security Error: Executable files are blocked.")

        # Validate allowed extensions list
        if self.allowed_extensions and ext not in self.allowed_extensions:
            allowed_str = ", ".join(self.allowed_extensions).upper()
            raise ValidationError(
                f"Unsupported file extension. Allowed formats are: {allowed_str}."
            )

        # 3. Reject executable content types
        content_type = getattr(value, "content_type", "")
        if content_type:
            blocked_types = [
                "application/x-dosexec",
                "application/x-executable",
                "application/x-sharedlib",
                "application/javascript",
                "text/javascript",
                "application/octet-stream",
            ]
            if (
                content_type in blocked_types
                and ext not in self.allowed_extensions
            ):
                raise ValidationError(
                    "Security Error: Executable content-type is blocked."
                )

        return value
