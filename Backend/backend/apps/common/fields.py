import base64
import hashlib
import hmac
import json
import os
import struct
from django.db import models
from django.conf import settings


class PurePythonCrypto:
    """
    Symmetric encryption using HMAC-SHA256 in Counter (CTR) mode.
    Implemented entirely using the Python standard library for zero dependencies.
    """

    @staticmethod
    def _get_derived_key():
        return hashlib.sha256(settings.SECRET_KEY.encode()).digest()

    @staticmethod
    def encrypt(plaintext: str) -> str:
        if not plaintext:
            return ""
        key = PurePythonCrypto._get_derived_key()
        salt = os.urandom(16)
        plaintext_bytes = plaintext.encode("utf-8")

        ciphertext = bytearray()
        block_size = 32  # Output size of SHA-256
        num_blocks = (len(plaintext_bytes) + block_size - 1) // block_size

        for i in range(num_blocks):
            counter_block = salt + struct.pack(">I", i)
            keystream_block = hmac.new(key, counter_block, hashlib.sha256).digest()

            start = i * block_size
            end = min(start + block_size, len(plaintext_bytes))
            for j in range(start, end):
                ciphertext.append(plaintext_bytes[j] ^ keystream_block[j - start])

        payload = salt + bytes(ciphertext)
        return base64.b64encode(payload).decode("utf-8")

    @staticmethod
    def decrypt(ciphertext_b64: str) -> str:
        if not ciphertext_b64:
            return ""
        try:
            payload = base64.b64decode(ciphertext_b64.encode("utf-8"))
            if len(payload) < 16:
                return ciphertext_b64
            salt = payload[:16]
            ciphertext = payload[16:]
            key = PurePythonCrypto._get_derived_key()

            plaintext = bytearray()
            block_size = 32
            num_blocks = (len(ciphertext) + block_size - 1) // block_size

            for i in range(num_blocks):
                counter_block = salt + struct.pack(">I", i)
                keystream_block = hmac.new(key, counter_block, hashlib.sha256).digest()

                start = i * block_size
                end = min(start + block_size, len(ciphertext))
                for j in range(start, end):
                    plaintext.append(ciphertext[j - start] ^ keystream_block[j - start])

            return plaintext.decode("utf-8")
        except Exception:
            return ciphertext_b64


class EncryptedCharField(models.CharField):
    """
    Django CharField that automatically encrypts values on write
    and decrypts them on read using PurePythonCrypto.
    """

    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        if value:
            return PurePythonCrypto.encrypt(value)
        return value

    def from_db_value(self, value, expression, connection):
        if value:
            return PurePythonCrypto.decrypt(value)
        return value

    def to_python(self, value):
        if value is None or isinstance(value, str):
            return value
        return self.from_db_value(value, None, None)


class EncryptedJSONField(models.JSONField):
    """
    Django JSONField that automatically encrypts JSON payloads on write
    and decrypts them on read using PurePythonCrypto.
    """

    def get_prep_value(self, value):
        if value is not None:
            serialized = json.dumps(value)
            return PurePythonCrypto.encrypt(serialized)
        return value

    def from_db_value(self, value, expression, connection):
        if value:
            try:
                decrypted = PurePythonCrypto.decrypt(value)
                return json.loads(decrypted)
            except Exception:
                try:
                    return json.loads(value)
                except Exception:
                    return value
        return value

    def to_python(self, value):
        if value is None or isinstance(value, (dict, list)):
            return value
        return self.from_db_value(value, None, None)
