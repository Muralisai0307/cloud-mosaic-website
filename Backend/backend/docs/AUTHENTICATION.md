# Authentication & MFA Architecture

This document describes the workflows for primary authentication (JWT), secondary verification (OTP), and Multi-Factor Authentication (TOTP).

---

## 🔑 1. Primary Authentication (JWT)

- **Login Endpoint**: `POST /api/v1/auth/login/`
- **Output States**:
  - **MFA Disabled**: Returns `access` token, `refresh` token, and `user` payload immediately.
  - **MFA Enabled**: Returns `mfa_required: True` and a temporary signature `temp_token` (expires in 5 minutes).

---

## 📱 2. Multi-Factor Authentication (MFA)

Uses pure-Python RFC 6238 TOTP validation, compatible with standard Google and Microsoft Authenticator apps.

### Setup Flow
1. **Initialize Setup**: `POST /api/v1/auth/mfa/setup/` (requires token). Returns a Base32 `secret`, an `otpauth` QR provisioning URI, and a list of 5 numeric emergency `backup_codes`.
2. **Verify Setup**: `POST /api/v1/auth/mfa/verify/` (receives `totp_code`). Activates MFA upon successful token validation.

### Challenge Login Flow
1. Initiate primary login ➡️ Receive `temp_token` and `mfa_required: True`.
2. Verify Challenge: `POST /api/v1/auth/mfa/login/` (receives `temp_token` and `totp_code` or `backup_code`).
3. Returns `access` and `refresh` JWT tokens on validation success.

### Disable Flow
- **Disable Endpoint**: `POST /api/v1/auth/mfa/disable/` (receives `totp_code` or a valid backup code).

---

## ✉️ 3. OTP Verification System

Used for Password Reset, Email Activation, and Login Verifications.

- **Request Code**: `POST /api/v1/auth/send-otp/` (generates and emails a 6-digit number, active for 10 minutes).
- **Validate Code**: `POST /api/v1/auth/verify-otp/` (validates code against user/purpose. Maximum of 3 attempts before code invalidation).
- **Resend Code**: `POST /api/v1/auth/resend-otp/`.
