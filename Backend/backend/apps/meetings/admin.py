from django.contrib import admin
from apps.meetings.models import MeetingBooking


@admin.register(MeetingBooking)
class MeetingBookingAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "email",
        "phone",
        "meeting_date",
        "meeting_time",
        "created_at",
    )
    list_filter = ("meeting_date", "service")
    search_fields = ("full_name", "email", "company")
    readonly_fields = ("created_at",)
