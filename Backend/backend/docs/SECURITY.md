# Enterprise Security Architecture

This document documents the security patterns, cryptography policies, auditing logs, and access restriction layers configured across the application.

---

## 🔒 1. Cryptography Standards

- **Field-Level Encryption (PII)**:
  - Encryption Standard: AES-256-CBC via Fernet symmetric cryptography.
  - Secret keys are derived dynamically from the application's unique `SECRET_KEY` using SHA-256.
  - Fields covered: employee phone, physical addresses, emergency contact details, and TOTP secret keys.
- **OTP Protection**: Verification tokens are stored in the database as SHA-256 hashes, protecting them against database dump disclosure.

---

## 🚦 2. Rate Limiting & Brute-Force Prevention

- **OTP Limit Retries**:
  - A maximum of **3 failed validation attempts** is allowed per OTP record.
  - Upon reaching the threshold, the OTP is automatically invalidated.
- **Brute-Force Login Protections**:
  - Temporary challenge tokens (`temp_token`) used in the MFA verification phase expire exactly after **5 minutes** (300 seconds).

---

## 📝 3. Security Auditing Logs

All authentication activities, security alerts, and setup adjustments are routed to dedicated files:

1. **`logs/auth.log`**:
   - Primary logins and logouts.
   - Successful MFA login authorizations.
2. **`logs/security.log`**:
   - OTP dispatches and successful verifications.
   - Failed OTP verification attempts (including reason/exceeded attempts).
   - MFA setups, activations, and disabling events.
   - Failed MFA setup and login challenges.
