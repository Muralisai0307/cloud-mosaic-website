from .base import *

# Ensure Debug is turned off in production
DEBUG = False

# Strict Security settings
SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "True").lower() in (
    "true",
    "1",
    "yes",
)
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", 31536000))  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# X-Frame-Options
X_FRAME_OPTIONS = "DENY"

# Production DB checks - raise error if SECRET_KEY is the insecure default key in production
if SECRET_KEY == "django-insecure-development-key-for-cloud-mosaic-backend":
    raise ValueError("The SECRET_KEY must be changed from the development default in production environments.")

# Static files storage using WhiteNoise optimized backend (manifest compression and caching)
# This was defined in base.py under STORAGES, which is valid for Django 4.2+ and 5.0+
