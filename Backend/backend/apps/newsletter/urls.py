from django.urls import path
from apps.newsletter.views import NewsletterCreateView

urlpatterns = [
    path("", NewsletterCreateView.as_view(), name="newsletter-subscribe"),
]
