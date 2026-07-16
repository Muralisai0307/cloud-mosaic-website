from django.contrib import admin
from apps.testimonials.models import Testimonial


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "service", "rating", "created_at")
    list_filter = ("rating", "service")
    search_fields = ("name", "company", "review")
    readonly_fields = ("created_at",)
