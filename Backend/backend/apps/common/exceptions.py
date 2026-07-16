import logging
import traceback
from django.core.exceptions import (
    ValidationError as DjangoValidationError,
    ObjectDoesNotExist,
)
from django.db import IntegrityError, DatabaseError
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    ValidationError as DRFValidationError,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    MethodNotAllowed,
    ParseError,
)
from rest_framework.response import Response

# Configure Loggers
api_logger = logging.getLogger("apps.api")
auth_logger = logging.getLogger("apps.auth")
db_logger = logging.getLogger("apps.db")
security_logger = logging.getLogger("apps.security")
error_logger = logging.getLogger("apps.error")


# ==========================================
# 1. Custom Business Logic Exceptions
# ==========================================


class BaseAPIException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "A business logic error occurred."
    default_code = "BUSINESS_ERROR"
    internal_error_code = "SERVER_001"

    def __init__(self, detail=None, code=None, internal_error_code=None):
        super().__init__(detail, code)
        if internal_error_code:
            self.internal_error_code = internal_error_code


class ContactSubmissionError(BaseAPIException):
    default_detail = "Contact submission failed."
    default_code = "contact_submission_error"
    internal_error_code = "CONTACT_001"


class DuplicateApplicationError(BaseAPIException):
    default_detail = "You have already applied for this job."
    default_code = "duplicate_application"
    internal_error_code = "CAREER_001"


class InvalidResumeError(BaseAPIException):
    default_detail = "The resume file provided is invalid."
    default_code = "invalid_resume"
    internal_error_code = "CAREER_002"


class MeetingAlreadyBookedError(BaseAPIException):
    default_detail = "This meeting slot is already booked."
    default_code = "meeting_already_booked"
    internal_error_code = "MEETING_001"


class NewsletterAlreadySubscribedError(BaseAPIException):
    default_detail = "This email is already subscribed to the newsletter."
    default_code = "newsletter_already_subscribed"
    internal_error_code = "NEWSLETTER_001"


class BusinessLogicError(BaseAPIException):
    default_detail = "A business logic error occurred."
    default_code = "business_logic_error"
    internal_error_code = "SERVER_001"


# ==========================================
# 2. Centralized Global Exception Handler
# ==========================================


def global_exception_handler(exc, context):
    """
    Centralized exception handler producing standardized JSON payloads:
    {
        "success": false,
        "message": "...",
        "errors": {},
        "error_code": "...",
        "status_code": 400,
        "timestamp": "...",
        "path": "..."
    }
    """
    request = context.get("request")
    path = request.path if request else "unknown"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    message = "An unexpected server error occurred."
    errors = {}
    error_code = "SERVER_001"

    # Base debug validation setting to hide stack traces in production
    from django.conf import settings

    debug_mode = getattr(settings, "DEBUG", False)

    # Convert native Django/DB exceptions to DRF Exceptions first
    if isinstance(exc, DjangoValidationError):
        # Extract messages from Django Validation error
        exc_dict = getattr(exc, "message_dict", None)
        if exc_dict:
            exc = DRFValidationError(detail=exc_dict)
        else:
            exc = DRFValidationError(detail=exc.messages)

    elif isinstance(exc, ObjectDoesNotExist):
        status_code = status.HTTP_404_NOT_FOUND
        message = "The requested resource could not be found."
        error_code = "DATABASE_002"
        db_logger.warning(
            f"ObjectDoesNotExist error at {path}: {str(exc)}"
        )
        return Response(
            {
                "success": False,
                "message": message,
                "errors": {},
                "error_code": error_code,
                "status_code": status_code,
                "timestamp": timezone.now().isoformat(),
                "path": path,
            },
            status=status_code,
        )

    elif isinstance(exc, (IntegrityError, DatabaseError)):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        message = "A database error occurred."
        error_code = "DATABASE_001"
        db_logger.error(
            f"Database error at {path}: {str(exc)}\n{traceback.format_exc()}"
        )
        return Response(
            {
                "success": False,
                "message": message if not debug_mode else str(exc),
                "errors": {},
                "error_code": error_code,
                "status_code": status_code,
                "timestamp": timezone.now().isoformat(),
                "path": path,
            },
            status=status_code,
        )

    # Process standard DRF Exceptions
    if isinstance(exc, APIException):
        status_code = exc.status_code
        error_detail = exc.detail

        # Map internal error codes
        if hasattr(exc, "internal_error_code"):
            error_code = exc.internal_error_code
        elif isinstance(exc, DRFValidationError):
            error_code = "VALIDATION_001"
            message = "Validation failed"
        elif isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            error_code = "AUTH_001"
            message = "Authentication credentials were not provided or are invalid."
        elif isinstance(exc, PermissionDenied):
            error_code = "AUTH_002"
            message = "You do not have permission to perform this action."
        elif isinstance(exc, MethodNotAllowed):
            error_code = "SERVER_005"
            message = getattr(exc, "detail", str(exc))
        elif isinstance(exc, ParseError):
            error_code = "SERVER_006"
            message = "Malformed request payload."
        else:
            error_code = "SERVER_001"
            message = getattr(exc, "detail", str(exc))

        # Format DRF validation errors
        if isinstance(error_detail, dict):
            errors = error_detail
            # If the error dict has detail, lift it as message
            if "detail" in errors:
                message = errors["detail"]
                if len(errors) == 1:
                    errors = {}
        elif isinstance(error_detail, list):
            errors = {"non_field_errors": error_detail}
        else:
            message = str(error_detail)

        # Logging warnings for validation / authentication / permissions
        if isinstance(exc, DRFValidationError):
            api_logger.warning(
                f"Validation Failure at {path}: {errors}"
            )
        elif isinstance(exc, (AuthenticationFailed, NotAuthenticated, PermissionDenied)):
            auth_logger.warning(
                f"Auth Violation at {path}: {message} | User: {request.user if request else 'Anonymous'}"
            )
            security_logger.warning(
                f"Security Warning: unauthorized access attempt to path '{path}'"
            )

        return Response(
            {
                "success": False,
                "message": message,
                "errors": errors,
                "error_code": error_code,
                "status_code": status_code,
                "timestamp": timezone.now().isoformat(),
                "path": path,
            },
            status=status_code,
        )

    # Handle unhandled Python exceptions
    error_logger.error(
        f"Unhandled Exception at {path}: {str(exc)}\n{traceback.format_exc()}"
    )

    # Mask stack trace in production (DEBUG=False)
    err_message = message
    if debug_mode:
        err_message = f"{message} Details: {str(exc)}"

    return Response(
        {
            "success": False,
            "message": err_message,
            "errors": {},
            "error_code": error_code,
            "status_code": status_code,
            "timestamp": timezone.now().isoformat(),
            "path": path,
        },
        status=status_code,
    )
