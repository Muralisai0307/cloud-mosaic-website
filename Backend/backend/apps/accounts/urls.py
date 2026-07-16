from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import (
    ChangePasswordView,
    EmailVerificationView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    RegisterView,
    ResetPasswordView,
    SendOTPView,
    VerifyOTPView,
    ResendOTPView,
    MFASetupView,
    MFAVerifyView,
    MFADisableView,
    MFALoginView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth_login"),
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("logout/", LogoutView.as_view(), name="auth_logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("change-password/", ChangePasswordView.as_view(), name="auth_change_password"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="auth_forgot_password"),
    path("reset-password/", ResetPasswordView.as_view(), name="auth_reset_password"),
    path("verify-email/", EmailVerificationView.as_view(), name="auth_verify_email"),
    # OTP verification system
    path("send-otp/", SendOTPView.as_view(), name="auth_send_otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="auth_verify_otp"),
    path("resend-otp/", ResendOTPView.as_view(), name="auth_resend_otp"),
    # Multi-Factor Authentication TOTP
    path("mfa/setup/", MFASetupView.as_view(), name="auth_mfa_setup"),
    path("mfa/verify/", MFAVerifyView.as_view(), name="auth_mfa_verify"),
    path("mfa/disable/", MFADisableView.as_view(), name="auth_mfa_disable"),
    path("mfa/login/", MFALoginView.as_view(), name="auth_mfa_login"),
]
