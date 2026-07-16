import datetime
import hashlib
import logging
import random
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.accounts.models import OTPVerification

logger = logging.getLogger("apps.auth")
security_logger = logging.getLogger("apps.security")


class OTPService:
    """
    Handles business logic for generating, sending, and validating OTP codes.
    """

    @staticmethod
    def generate_otp(user, purpose):
        """
        Idempotently generates a 6-digit numeric OTP code for a user/purpose,
        invalidating previous active codes.
        """
        # Invalidate existing active OTPs for this user and purpose
        OTPVerification.objects.filter(
            user=user, purpose=purpose, verified_status=False
        ).update(verified_status=True)  # Set to true so they cannot be reused

        # Generate 6-digit numeric code
        raw_code = f"{random.randint(100000, 999999):06d}"
        hashed_code = hashlib.sha256(raw_code.encode()).hexdigest()
        
        expiry = timezone.now() + datetime.timedelta(minutes=10)

        record = OTPVerification.objects.create(
            user=user,
            otp_code=hashed_code,
            purpose=purpose,
            expiry_time=expiry,
            verified_status=False,
            attempt_count=0,
        )

        logger.info(f"OTP generated for user '{user.username}' for purpose '{purpose}'. ID: {record.id}")
        
        # Dispatch code
        OTPService.send_otp(user, raw_code, purpose)
        return raw_code

    @staticmethod
    def verify_otp(user, otp_code, purpose):
        """
        Validates OTP codes, tracks retry count limits, and invalidates on success.
        """
        now = timezone.now()
        record = OTPVerification.objects.filter(
            user=user, purpose=purpose, verified_status=False, expiry_time__gt=now
        ).order_by("-created_at").first()

        if not record:
            security_logger.warning(f"Failed OTP verification: No active OTP record found for '{user.username}' ({purpose})")
            raise ValidationError("OTP is invalid or has expired.")

        if record.attempt_count >= 3:
            # Maximum retry limit reached, invalidate the OTP
            record.verified_status = True
            record.save()
            security_logger.warning(f"Failed OTP verification: Max retries exceeded for '{user.username}'")
            raise ValidationError("Maximum verification attempts exceeded. Please request a new OTP.")

        # Increment attempts
        record.attempt_count += 1
        record.save()

        # Compare hashed code
        input_hash = hashlib.sha256(otp_code.strip().encode()).hexdigest()
        if record.otp_code != input_hash:
            security_logger.warning(
                f"Failed OTP verification: Invalid code matching check for '{user.username}' (Attempt: {record.attempt_count})"
            )
            raise ValidationError("Invalid OTP code.")

        # Successful verification
        record.verified_status = True
        record.save()
        
        logger.info(f"OTP successfully verified for user '{user.username}' ({purpose})")
        return True

    @staticmethod
    def send_otp(user, otp_code, purpose):
        """
        Dispatches mock OTP notifications to logs/console.
        """
        msg = f"[OTP DISPATCH MOCK] To: {user.email}. Purpose: {purpose}. Verification Code: {otp_code}"
        logger.info(msg)
        print(msg)
