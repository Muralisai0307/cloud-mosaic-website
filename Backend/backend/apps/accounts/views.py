from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.serializers import (
    ChangePasswordSerializer,
    EmailVerificationSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    ResetPasswordSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    MFAVerifySerializer,
    MFADisableSerializer,
    MFALoginSerializer,
    RegisterSerializer,
)
from apps.common.services.auth_service import AuthService
from apps.common.views import BaseAPIView


class LoginView(BaseAPIView):
    """
    POST /api/v1/auth/login/
    Authenticates username and password and returns JWT access & refresh tokens.
    """

    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="User Login",
        request=LoginSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Successful Login Response",
                examples=[
                    OpenApiExample(
                        "Successful Login Response",
                        value={
                            "success": True,
                            "message": "Login successful",
                            "data": {
                                "access": "eyJhbGciOiJIUzI1NiIsIn...",
                                "refresh": "eyJhbGciOiJIUzI1NiIsIn...",
                                "user": {
                                    "id": 1,
                                    "username": "admin",
                                    "email": "admin@cloudmosaic.com",
                                },
                            },
                        },
                    )
                ]
            ),
            status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
                description="Unauthorized Response",
                examples=[
                    OpenApiExample(
                        "Unauthorized Response",
                        value={
                            "success": False,
                            "message": "Invalid username or password.",
                            "status_code": 401,
                        },
                    )
                ]
            ),
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = AuthService.login(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        message = "MFA challenge verification required." if result.get("mfa_required") else "Login successful"
        return Response(
            {
                "success": True,
                "message": message,
                "data": result,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(BaseAPIView):
    """
    POST /api/v1/auth/logout/
    Blacklists the provided JWT refresh token.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="User Logout",
        request=LogoutSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Successful Logout Response",
                examples=[
                    OpenApiExample(
                        "Successful Logout Response",
                        value={"success": True, "message": "Logout successful"},
                    )
                ]
            )
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthService.logout(refresh_token=serializer.validated_data["refresh"])

        return Response(
            {"success": True, "message": "Logout successful"},
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(BaseAPIView):
    """
    POST /api/v1/auth/change-password/
    Authenticated endpoint to change the current user's password.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="Change User Password",
        request=ChangePasswordSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Successful Password Change",
                examples=[
                    OpenApiExample(
                        "Successful Response",
                        value={"success": True, "message": "Password changed successfully"},
                    )
                ]
            )
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthService.change_password(
            user=request.user,
            old_password=serializer.validated_data["old_password"],
            new_password=serializer.validated_data["new_password"],
        )

        return Response(
            {"success": True, "message": "Password changed successfully"},
            status=status.HTTP_200_OK,
        )


class ForgotPasswordView(BaseAPIView):
    """
    POST /api/v1/auth/forgot-password/
    Generates a secure password reset token and sends it via mocked mail.
    Always returns success to prevent user enumeration.
    """

    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="Forgot Password Request",
        request=ForgotPasswordSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Generic Success Response",
                examples=[
                    OpenApiExample(
                        "Generic Success Response",
                        value={
                            "success": True,
                            "message": "If an account matches that email address, a password reset link has been sent.",
                        },
                    )
                ]
            )
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = AuthService.send_forgot_password(
            email=serializer.validated_data["email"]
        )

        return Response(
            {"success": True, "message": message},
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(BaseAPIView):
    """
    POST /api/v1/auth/reset-password/
    Validates token and resets the user's password securely.
    """

    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="Reset Password with Token",
        request=ResetPasswordSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Successful Password Reset",
                examples=[
                    OpenApiExample(
                        "Successful Response",
                        value={
                            "success": True,
                            "message": "Password has been reset successfully",
                        },
                    )
                ]
            )
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthService.reset_password(
            uidb64=serializer.validated_data["uid"],
            token=serializer.validated_data["token"],
            new_password=serializer.validated_data["new_password"],
        )

        return Response(
            {"success": True, "message": "Password has been reset successfully"},
            status=status.HTTP_200_OK,
        )


class EmailVerificationView(BaseAPIView):
    """
    POST /api/v1/auth/verify-email/
    Verifies user email via security verification token.
    """

    permission_classes = [AllowAny]
    serializer_class = EmailVerificationSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="Verify User Email",
        request=EmailVerificationSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Successful Email Verification",
                examples=[
                    OpenApiExample(
                        "Successful Response",
                        value={"success": True, "message": "Email verified successfully"},
                    )
                ]
            )
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthService.verify_email(token=serializer.validated_data["token"])

        return Response(
            {"success": True, "message": "Email verified successfully"},
            status=status.HTTP_200_OK,
        )


class SendOTPView(BaseAPIView):
    """
    POST /api/v1/auth/send-otp/
    Generates and dispatches a fresh OTP to the user's email address.
    """

    permission_classes = [AllowAny]
    serializer_class = SendOTPSerializer

    @extend_schema(
        tags=["OTP Verification"],
        summary="Request OTP Verification Code",
        request=SendOTPSerializer,
        responses={200: OpenApiResponse(description="OTP Code Sent")},
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        purpose = serializer.validated_data["purpose"]

        from django.contrib.auth import get_user_model
        from apps.common.services.otp_service import OTPService

        User = get_user_model()
        user = User.objects.filter(email=email).first()
        if user:
            # Generate and dispatch OTP
            OTPService.generate_otp(user, purpose)
            
            # Security logging
            import logging
            security_logger = logging.getLogger("apps.security")
            security_logger.info(f"OTP generated for user '{user.username}' for purpose '{purpose}'")

        # Always return generic success response to prevent email discovery/enumeration scans
        return Response(
            {
                "success": True,
                "message": "A verification code has been sent to your email address if it is registered.",
            },
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(BaseAPIView):
    """
    POST /api/v1/auth/verify-otp/
    Validates a submitted OTP matching purpose and user scope.
    """

    permission_classes = [AllowAny]
    serializer_class = VerifyOTPSerializer

    @extend_schema(
        tags=["OTP Verification"],
        summary="Verify OTP Code",
        request=VerifyOTPSerializer,
        responses={200: OpenApiResponse(description="OTP Code Verified Successfully")},
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        otp_code = serializer.validated_data["otp_code"]
        purpose = serializer.validated_data["purpose"]

        from django.contrib.auth import get_user_model
        from apps.common.services.otp_service import OTPService
        from rest_framework.exceptions import ValidationError

        User = get_user_model()
        user = User.objects.filter(email=email).first()
        if not user:
            raise ValidationError({"email": "No active user registered with this email address."})

        OTPService.verify_otp(user, otp_code, purpose)

        import logging
        security_logger = logging.getLogger("apps.security")
        security_logger.info(f"OTP successfully verified for user '{user.username}' ({purpose})")

        return Response(
            {"success": True, "message": "Verification code validated successfully."},
            status=status.HTTP_200_OK,
        )


class ResendOTPView(BaseAPIView):
    """
    POST /api/v1/auth/resend-otp/
    Resends/regenerates an active verification OTP code.
    """

    permission_classes = [AllowAny]
    serializer_class = ResendOTPSerializer

    @extend_schema(
        tags=["OTP Verification"],
        summary="Resend Verification OTP Code",
        request=ResendOTPSerializer,
        responses={200: OpenApiResponse(description="OTP Code Resent")},
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        purpose = serializer.validated_data["purpose"]

        from django.contrib.auth import get_user_model
        from apps.common.services.otp_service import OTPService

        User = get_user_model()
        user = User.objects.filter(email=email).first()
        if user:
            OTPService.generate_otp(user, purpose)

        return Response(
            {
                "success": True,
                "message": "A verification code has been resent to your email address if it is registered.",
            },
            status=status.HTTP_200_OK,
        )


class MFASetupView(BaseAPIView):
    """
    POST /api/v1/auth/mfa/setup/
    Initiates TOTP multi-factor setup, generating key and configuration URI.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Multi-Factor Authentication (MFA)"],
        summary="Initiate MFA Setup",
        request=None,
        responses={200: OpenApiResponse(description="MFA Setup Details")},
    )
    def post(self, request):
        from apps.accounts.models import UserMFA
        from apps.common.services.mfa_service import MFAService

        mfa_config, created = UserMFA.objects.get_or_create(user=request.user)
        if mfa_config.enabled:
            return Response(
                {"success": False, "message": "Multi-factor authentication is already enabled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        secret = MFAService.generate_secret()
        mfa_config.secret_key = secret
        mfa_config.backup_codes = MFAService.generate_backup_codes()
        mfa_config.save()

        uri = MFAService.get_totp_uri(secret, request.user.username)

        return Response(
            {
                "success": True,
                "data": {
                    "secret": secret,
                    "qr_uri": uri,
                    "backup_codes": mfa_config.backup_codes,
                },
            },
            status=status.HTTP_200_OK,
        )


class MFAVerifyView(BaseAPIView):
    """
    POST /api/v1/auth/mfa/verify/
    Verifies TOTP validation code setup and activates MFA settings.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = MFAVerifySerializer

    @extend_schema(
        tags=["Multi-Factor Authentication (MFA)"],
        summary="Verify and Enable MFA Setup",
        request=MFAVerifySerializer,
        responses={200: OpenApiResponse(description="MFA Successfully Activated")},
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        totp_code = serializer.validated_data["totp_code"]

        from apps.accounts.models import UserMFA
        from apps.common.services.mfa_service import MFAService
        from rest_framework.exceptions import ValidationError
        import logging

        security_logger = logging.getLogger("apps.security")

        mfa_config = UserMFA.objects.filter(user=request.user).first()
        if not mfa_config or not mfa_config.secret_key:
            raise ValidationError("MFA setup is not initialized. Please call setup endpoint first.")

        if mfa_config.enabled:
            return Response(
                {"success": False, "message": "MFA is already active and verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not MFAService.verify_totp(mfa_config.secret_key, totp_code):
            security_logger.warning(f"Failed MFA setup verification attempt for user '{request.user.username}'")
            raise ValidationError("Invalid authentication code. Verification failed.")

        mfa_config.enabled = True
        mfa_config.save()

        security_logger.info(f"MFA successfully enabled for user '{request.user.username}'")

        return Response(
            {"success": True, "message": "Multi-factor authentication enabled successfully."},
            status=status.HTTP_200_OK,
        )


class MFADisableView(BaseAPIView):
    """
    POST /api/v1/auth/mfa/disable/
    Disables multi-factor authentication for the user.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = MFADisableSerializer

    @extend_schema(
        tags=["Multi-Factor Authentication (MFA)"],
        summary="Deactivate and Disable MFA",
        request=MFADisableSerializer,
        responses={200: OpenApiResponse(description="MFA Successfully Deactivated")},
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        totp_code = serializer.validated_data["totp_code"]

        from apps.accounts.models import UserMFA
        from apps.common.services.mfa_service import MFAService
        from rest_framework.exceptions import ValidationError
        import logging

        security_logger = logging.getLogger("apps.security")

        mfa_config = UserMFA.objects.filter(user=request.user).first()
        if not mfa_config or not mfa_config.enabled:
            return Response(
                {"success": False, "message": "MFA configuration is not enabled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check TOTP or backup codes
        is_valid = MFAService.verify_totp(mfa_config.secret_key, totp_code)
        if not is_valid and totp_code in mfa_config.backup_codes:
            is_valid = True
            mfa_config.backup_codes.remove(totp_code)

        if not is_valid:
            security_logger.warning(f"Failed MFA disable attempt for user '{request.user.username}'")
            raise ValidationError("Invalid authentication or backup code.")

        mfa_config.enabled = False
        mfa_config.save()

        security_logger.info(f"MFA disabled for user '{request.user.username}'")

        return Response(
            {"success": True, "message": "Multi-factor authentication has been disabled."},
            status=status.HTTP_200_OK,
        )


class MFALoginView(BaseAPIView):
    """
    POST /api/v1/auth/mfa/login/
    Validates a TOTP or backup code challenge and returns access & refresh JWT tokens.
    """

    permission_classes = [AllowAny]
    serializer_class = MFALoginSerializer

    @extend_schema(
        tags=["Multi-Factor Authentication (MFA)"],
        summary="Submit Login MFA Challenge Code",
        request=MFALoginSerializer,
        responses={200: OpenApiResponse(description="Login Success / Returns JWT")},
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        temp_token = serializer.validated_data["temp_token"]
        totp_code = serializer.validated_data["totp_code"]

        from django.core import signing
        from django.contrib.auth import get_user_model
        from apps.accounts.models import UserMFA
        from apps.common.services.mfa_service import MFAService
        from rest_framework.exceptions import ValidationError, AuthenticationFailed
        from rest_framework_simplejwt.tokens import RefreshToken
        import logging

        security_logger = logging.getLogger("apps.security")
        logger = logging.getLogger("apps.auth")

        # Decode temporary validation payload (max lifespan: 5 minutes)
        try:
            payload = signing.loads(temp_token, salt="mfa-login", max_age=300)
        except Exception:
            raise ValidationError("MFA challenge token has expired or is invalid.")

        User = get_user_model()
        user = User.objects.filter(id=payload["user_id"]).first()
        if not user or not user.is_active:
            raise AuthenticationFailed("User account is inactive or not found.")

        mfa_config = UserMFA.objects.filter(user=user).first()
        if not mfa_config or not mfa_config.enabled:
            raise ValidationError("MFA is not enabled for this user account.")

        # Match TOTP challenge
        is_valid = MFAService.verify_totp(mfa_config.secret_key, totp_code)
        
        # Match backup codes
        if not is_valid and totp_code in mfa_config.backup_codes:
            is_valid = True
            mfa_config.backup_codes.remove(totp_code)
            mfa_config.save()
            security_logger.info(f"MFA backup code used for login: '{user.username}'")

        if not is_valid:
            security_logger.warning(f"Failed MFA login verification for user '{user.username}'")
            raise AuthenticationFailed("Invalid multi-factor authentication code.")

        # Verification success - Generate standard JWTs
        refresh = RefreshToken.for_user(user)

        logger.info(f"Successful MFA login for user: {user.username} (ID: {user.pk})")
        return Response(
            {
                "success": True,
                "message": "Login successful",
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.pk,
                        "username": user.username,
                        "email": user.email,
                    },
                },
            },
            status=status.HTTP_200_OK,
        )


class RegisterView(BaseAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="User Registration",
        request=RegisterSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description="User registered successfully"
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description="Validation error"
            ),
        },
    )
    def post(self, request):
        from django.contrib.auth.models import User
        from apps.accounts.models import Role, UserRole
        from apps.clients.models import ClientProfile

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # Create User
        user = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"]
        )

        # Get or create Client role
        client_role, _ = Role.objects.get_or_create(
            name="Client",
            defaults={"description": "Client user role for Client Portal access"}
        )

        # Assign role to user
        UserRole.objects.get_or_create(user=user, role=client_role)

        # Create ClientProfile
        company_name = data.get("company_name") or f"{data['username']}'s Company"
        industry = data.get("industry") or "Technology"
        ClientProfile.objects.create(
            user=user,
            company_name=company_name,
            company_email=data["email"],
            industry=industry,
            is_active=True
        )

        return Response(
            {
                "success": True,
                "message": "User registered successfully as client.",
                "data": {
                    "user": {
                        "id": user.pk,
                        "username": user.username,
                        "email": user.email,
                    },
                    "company_name": company_name,
                    "industry": industry,
                }
            },
            status=status.HTTP_201_CREATED
        )


