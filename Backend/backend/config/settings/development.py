from .base import *

# Development security overrides
DEBUG = True

# Standard dev-specific config can go here
# e.g., enabling Django Debug Toolbar if needed or altering caching strategies
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}
