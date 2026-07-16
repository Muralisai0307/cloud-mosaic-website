from django.urls import path

from apps.meetings.views import (
    MeetingBookingCreateView,
    MeetingBookingDetailView,
    MeetingBookingListView,
)

urlpatterns = [
    path("book/", MeetingBookingCreateView.as_view(), name="meeting-book"),
    path("", MeetingBookingListView.as_view(), name="meeting-list"),
    path("<int:pk>/", MeetingBookingDetailView.as_view(), name="meeting-detail"),
]
