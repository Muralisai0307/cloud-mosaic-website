import logging
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
logger = logging.getLogger("auth")


class AuthService:
    """
    Central service handling Authentication, JWT generation, Password Management,
    and Email Verification.
    """

    @staticmethod
    def login(username, password):
        """
        Validates username/password, logs result, and returns JWT tokens or MFA challenge status.
        """
        user = authenticate(username=username, password=password)
        if user is None:
            logger.warning(f"Failed login attempt for username: {username}")
            raise AuthenticationFailed("Invalid username or password.")

        if not user.is_active:
            logger.warning(f"Disabled user attempted login: {username}")
            raise AuthenticationFailed("User account is disabled.")

        # Check MFA configuration status
        if hasattr(user, "mfa_config") and user.mfa_config.enabled:
            logger.info(f"MFA challenge requested for user: {username} (ID: {user.pk})")
            temp_token = signing.dumps(
                {"user_id": user.pk, "mfa_pending": True}, salt="mfa-login"
            )
            return {
                "mfa_required": True,
                "temp_token": temp_token,
                "user": {
                    "id": user.pk,
                    "username": user.username,
                    "email": user.email,
                },
            }

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        logger.info(f"Successful login for user: {username} (ID: {user.pk})")
        return {
            "mfa_required": False,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.pk,
                "username": user.username,
                "email": user.email,
            },
        }

    @staticmethod
    def logout(refresh_token):
        """
        Blacklists a refresh token.
        """
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info("Successful logout and token blacklisted.")
            return True
        except Exception as e:
            logger.error(f"Logout failed or token already blacklisted: {str(e)}")
            raise ValidationError({"refresh": "Invalid or blacklisted token."})

    @staticmethod
    def change_password(user, old_password, new_password):
        """
        Changes current user's password securely.
        """
        if not user.check_password(old_password):
            logger.warning(
                f"Password change failed: incorrect old password for user: {user.username}"
            )
            raise ValidationError({"old_password": "Old password is incorrect."})

        user.set_password(new_password)
        user.save()
        logger.info(f"Password changed successfully for user: {user.username}")
        return True

    @staticmethod
    def send_forgot_password(email):
        """
        Generates reset token and logs mock reset email.
        """
        # Always log search context securely
        user = User.objects.filter(email__iexact=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # Log mock email dispatch
            logger.info(
                f"Mock Email: Password reset email sent to {email}. Link: /reset-password/?uid={uid}&token={token}"
            )
        else:
            logger.info(
                f"Mock Email: Password reset requested for non-existent email: {email}."
            )

        # Generic message returned to prevent user enumeration
        return "If an account matches that email address, a password reset link has been sent."

    @staticmethod
    def reset_password(uidb64, token, new_password):
        """
        Validates token and updates user password.
        """
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            logger.warning("Password reset failed: invalid user ID decode.")
            raise ValidationError({"token": "Invalid or expired reset link."})

        if not default_token_generator.check_token(user, token):
            logger.warning(f"Password reset failed: invalid token for user: {user.username}")
            raise ValidationError({"token": "Invalid or expired reset link."})

        user.set_password(new_password)
        user.save()
        logger.info(f"Password reset successfully for user: {user.username}")
        return True

    @staticmethod
    def send_email_verification(user):
        """
        Generates email verification token and logs mock verification email.
        """
        # Use Django signing to generate a secure stateless token
        token = signing.dumps({"user_id": user.pk, "email": user.email})
        logger.info(
            f"Mock Email: Verification email sent to {user.email}. Link: /verify-email/?token={token}"
        )
        return token

    @staticmethod
    def verify_email(token):
        """
        Validates token and flags user profile as verified.
        """
        try:
            # Token valid for 24 hours
            data = signing.loads(token, max_age=86400)
            user_id = data.get("user_id")
            user = User.objects.get(pk=user_id)
        except (signing.SignatureExpired, signing.BadSignature, User.DoesNotExist) as e:
            logger.warning(f"Email verification failed: {str(e)}")
            raise ValidationError({"token": "Invalid or expired verification token."})

        profile, created = UserProfile.objects.get_or_create(user=user)
        if profile.is_email_verified:
            logger.info(f"Email already verified for user: {user.username}")
            return True

        profile.is_email_verified = True
        profile.save()
        logger.info(f"Email verified successfully for user: {user.username}")
        return True
