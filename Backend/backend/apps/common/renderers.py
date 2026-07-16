from rest_framework.renderers import JSONRenderer


class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None

        # If it's an error status code, it was already handled by handle_exception
        if response is not None and response.status_code >= 400:
            return super().render(data, accepted_media_type, renderer_context)

        # Prevent double-wrapping if the view already formatted it
        if isinstance(data, dict) and "success" in data:
            return super().render(data, accepted_media_type, renderer_context)

        # Retrieve a success message from the view if defined, otherwise use default
        message = "Operation successful."
        if renderer_context and "view" in renderer_context:
            view = renderer_context["view"]
            if hasattr(view, "success_message"):
                message = view.success_message

        # Custom success wrapping (adding status_code and ISO timestamp)
        from django.utils import timezone
        status_code = response.status_code if response else 200

        wrapped_data = {
            "success": True,
            "message": message,
            "data": data,
            "status_code": status_code,
            "timestamp": timezone.now().isoformat()
        }

        return super().render(wrapped_data, accepted_media_type, renderer_context)
