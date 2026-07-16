import time
import logging

logger = logging.getLogger("apps.api")


class APILoggingMiddleware:
    """
    Middleware that records HTTP request metadata (Method, Path, Status Code,
    Duration, IP Address, and User) securely.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Capture Client IP address safely
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR", "unknown")

        start_time = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start_time) * 1000)

        # 2. Capture authenticated user safely
        user = "Anonymous"
        if hasattr(request, "user") and request.user.is_authenticated:
            user = request.user.username

        # 3. Write metadata to log
        logger.info(
            f"Method: {request.method} | Path: {request.path} | Status: {response.status_code} | "
            f"Duration: {duration_ms}ms | IP: {ip} | User: {user}"
        )

        return response
