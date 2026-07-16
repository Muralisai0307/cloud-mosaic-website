import datetime
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.urls import reverse
from django.core import signing
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.exceptions import ValidationError

from apps.accounts.models import OTPVerification, UserMFA
from apps.common.services.otp_service import OTPService
from apps.common.services.mfa_service import MFAService

User = get_user_model()


class OTPVerificationTestCase(APITestCase):
    """
    Unit test coverage for OTP generation, expiration, validation and attempt count logic.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="securitytest",
            email="security@cloudmosaic.com",
            password="SecurePassword123!",
        )
        self.send_url = reverse("auth_send_otp")
        self.verify_url = reverse("auth_verify_otp")
        self.resend_url = reverse("auth_resend_otp")

    def test_otp_generation_and_mock_dispatch(self):
        # Generate code
        code = OTPService.generate_otp(self.user, "Login Verification")
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isdigit())

        # Check stored hash
        record = OTPVerification.objects.filter(
            user=self.user, purpose="Login Verification", verified_status=False
        ).first()
        self.assertIsNotNone(record)
        self.assertNotEqual(record.otp_code, code)  # Hashed in database

    def test_send_otp_api_endpoint(self):
        response = self.client.post(
            self.send_url,
            {"email": self.user.email, "purpose": "Password Reset"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        # Assert database contains record
        self.assertTrue(
            OTPVerification.objects.filter(
                user=self.user, purpose="Password Reset"
            ).exists()
        )

    def test_verify_otp_success(self):
        code = OTPService.generate_otp(self.user, "Email Verification")
        response = self.client.post(
            self.verify_url,
            {
                "email": self.user.email,
                "otp_code": code,
                "purpose": "Email Verification",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

    def test_otp_expiry_time_drift(self):
        code = OTPService.generate_otp(self.user, "Password Reset")
        record = OTPVerification.objects.get(user=self.user, purpose="Password Reset", verified_status=False)
        
        # Set expiry to past time
        record.expiry_time = timezone.now() - datetime.timedelta(seconds=1)
        record.save()

        with self.assertRaises(ValidationError):
            OTPService.verify_otp(self.user, code, "Password Reset")

    def test_otp_retry_limit_protection(self):
        code = OTPService.generate_otp(self.user, "Login Verification")
        
        # Attempt verification with invalid code 3 times
        for _ in range(3):
            with self.assertRaises(ValidationError) as ctx:
                OTPService.verify_otp(self.user, "000000", "Login Verification")
            self.assertIn("Invalid OTP code", str(ctx.exception))

        # 4th attempt should throw limit exceeded error
        with self.assertRaises(ValidationError) as ctx:
            OTPService.verify_otp(self.user, code, "Login Verification")
        self.assertIn("attempts exceeded", str(ctx.exception))


class MultiFactorAuthenticationTestCase(APITestCase):
    """
    Unit test coverage for MFA setups, QR provisioning generator, verification challenges, and login challenges.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="mfatest",
            email="mfa@cloudmosaic.com",
            password="SecurePassword123!",
        )
        self.setup_url = reverse("auth_mfa_setup")
        self.verify_url = reverse("auth_mfa_verify")
        self.disable_url = reverse("auth_mfa_disable")
        self.login_url = reverse("auth_login")
        self.mfa_login_url = reverse("auth_mfa_login")

    def test_mfa_setup_api(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.setup_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("secret", response.data["data"])
        self.assertIn("qr_uri", response.data["data"])
        self.assertEqual(len(response.data["data"]["backup_codes"]), 5)

    def test_mfa_activation_success(self):
        self.client.force_authenticate(user=self.user)
        
        # Setup
        setup_resp = self.client.post(self.setup_url)
        secret = setup_resp.data["data"]["secret"]

        # Calculate current TOTP code
        totp_code = MFAService.get_totp(secret)

        # Verify
        verify_resp = self.client.post(self.verify_url, {"totp_code": totp_code})
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(verify_resp.data["success"])

        # Check db
        config = UserMFA.objects.get(user=self.user)
        self.assertTrue(config.enabled)

    def test_mfa_login_challenge_flow(self):
        # 1. Enable MFA
        config = UserMFA.objects.create(
            user=self.user,
            secret_key=MFAService.generate_secret(),
            enabled=True,
            backup_codes=["12345678", "87654321"],
        )

        # 2. Login with primary password credentials
        login_resp = self.client.post(
            self.login_url,
            {"username": self.user.username, "password": "SecurePassword123!"},
        )
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(login_resp.data["data"]["mfa_required"])
        temp_token = login_resp.data["data"]["temp_token"]

        # 3. Submit invalid code to mfa challenge
        mfa_login_fail = self.client.post(
            self.mfa_login_url,
            {"temp_token": temp_token, "totp_code": "000000"},
        )
        self.assertEqual(mfa_login_fail.status_code, status.HTTP_401_UNAUTHORIZED)

        # 4. Submit valid code using backup code
        mfa_login_success = self.client.post(
            self.mfa_login_url,
            {"temp_token": temp_token, "totp_code": "12345678"},
        )
        self.assertEqual(mfa_login_success.status_code, status.HTTP_200_OK)
        self.assertIn("access", mfa_login_success.data["data"])
        
        # Verify backup code is consumed
        config.refresh_from_db()
        self.assertNotIn("12345678", config.backup_codes)
