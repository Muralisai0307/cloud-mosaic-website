import base64
import hashlib
import hmac
import logging
import random
import struct
import time
import urllib.parse
from rest_framework.exceptions import ValidationError

logger = logging.getLogger("apps.auth")
security_logger = logging.getLogger("apps.security")


class MFAService:
    """
    Pure-Python TOTP (RFC 6238) engine providing secure MFA registration,
    authenticator challenge checks, and emergency backup codes.
    """

    @staticmethod
    def generate_secret():
        """
        Generates a secure 32-character Base32 secret key.
        """
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
        return "".join(random.choice(chars) for _ in range(32))

    @staticmethod
    def generate_backup_codes(count=5):
        """
        Generates a list of 8-digit numeric backup codes.
        """
        return [f"{random.randint(10000000, 99999999)}" for _ in range(count)]

    @staticmethod
    def get_hotp(secret, intervals_no):
        """
        Calculates RFC 4226 HOTP value.
        """
        try:
            # Normalize padding for base32 decoding
            secret_padded = secret.upper()
            missing_padding = len(secret_padded) % 8
            if missing_padding:
                secret_padded += "=" * (8 - missing_padding)

            key = base64.b32decode(secret_padded, casefold=True)
            msg = struct.pack(">Q", intervals_no)
            h = hmac.new(key, msg, hashlib.sha1).digest()
            o = h[19] & 15
            h = (struct.unpack(">I", h[o : o + 4])[0] & 0x7FFFFFFF) % 1000000
            return f"{h:06d}"
        except Exception as e:
            logger.error(f"Error calculating HOTP token: {str(e)}")
            raise ValidationError("Could not calculate authentication token from secret.")

    @staticmethod
    def get_totp(secret):
        """
        Calculates RFC 6238 TOTP token.
        """
        return MFAService.get_hotp(secret, intervals_no=int(time.time()) // 30)

    @staticmethod
    def verify_totp(secret, token, window=1):
        """
        Validates a TOTP token against a time drift window (default 30 seconds).
        """
        token = str(token).strip()
        if not token.isdigit() or len(token) != 6:
            return False

        current_interval = int(time.time()) // 30
        for i in range(-window, window + 1):
            if MFAService.get_hotp(secret, current_interval + i) == token:
                return True
        return False

    @staticmethod
    def get_totp_uri(secret, username, issuer_name="CloudMosaic"):
        """
        Generates provisioning URI for Google Authenticator QR scans.
        """
        label = urllib.parse.quote(f"{issuer_name}:{username}")
        secret_param = secret.upper()
        issuer_param = urllib.parse.quote(issuer_name)
        return f"otpauth://totp/{label}?secret={secret_param}&issuer={issuer_param}&algorithm=SHA1&digits=6&period=30"
