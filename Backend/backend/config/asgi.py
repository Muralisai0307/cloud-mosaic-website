import os
from django.core.asgi import get_asgi_application

# Default to development settings; can be overridden by environment variable
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

application = get_asgi_application()
