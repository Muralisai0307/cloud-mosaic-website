from django.http import Http404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsAdmin, IsOwnerOrAdmin
from apps.common.services.meeting_service import MeetingService
from apps.common.views import BaseAPIView
from apps.meetings.models import MeetingBooking
from apps.meetings.serializers import MeetingBookingSerializer


class MeetingBookingCreateView(BaseAPIView):
    serializer_class = MeetingBookingSerializer
    success_message = "Your meeting has been scheduled successfully."

    @extend_schema(
        summary="Book Consultation Meeting",
        description="Books a client consulting appointment slot. Validates business hours (09:00 AM - 06:00 PM), checks for slot double-booking, restricts daily client limit to 1 per email, and sends a booking confirmation.",
        tags=["Meetings"],
        responses={
            201: OpenApiResponse(
                response=MeetingBookingSerializer,
                description="Meeting booked successfully.",
            ),
            400: OpenApiResponse(
                description="Validation Failure (past date, non-business hours, slot already occupied, client daily limit reached)."
            ),
            500: OpenApiResponse(description="Internal Server Error"),
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = MeetingBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Delegate business logic processing to the service layer
        booking = MeetingService.book_meeting(serializer.validated_data)

        # Serialize saved instance for response
        response_serializer = MeetingBookingSerializer(booking)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class MeetingBookingListView(BaseAPIView):
    """
    GET /api/v1/meetings/
    Retrieves all meeting bookings. Restricted to admins.
    """

    permission_classes = [IsAdmin]
    serializer_class = MeetingBookingSerializer

    @extend_schema(
        summary="List Scheduled Meetings",
        description="Retrieves a list of all scheduled meetings. Restricted to Admins.",
        tags=["Meetings"],
        operation_id="list_meetings",
        responses={
            200: OpenApiResponse(
                response=MeetingBookingSerializer(many=True),
                description="List of meetings.",
            ),
            401: OpenApiResponse(description="Unauthorized"),
            403: OpenApiResponse(description="Forbidden"),
        },
    )
    def get(self, request, *args, **kwargs):
        bookings = MeetingService.get_all_meetings()
        serializer = MeetingBookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MeetingBookingDetailView(BaseAPIView):
    """
    GET/PUT/PATCH /api/v1/meetings/<id>/
    Allows retrieving or updating a specific booking.
    Access restricted to the meeting owner or Admins.
    """

    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    serializer_class = MeetingBookingSerializer

    def get_object(self, pk):
        try:
            obj = MeetingBooking.objects.get(pk=pk)
            self.check_object_permissions(self.request, obj)
            return obj
        except MeetingBooking.DoesNotExist:
            raise Http404

    @extend_schema(
        summary="Retrieve Meeting Details",
        description="Retrieves the detailed specifications for a meeting booking. Restricted to meeting owner or Admins.",
        tags=["Meetings"],
        operation_id="retrieve_meeting",
        responses={
            200: OpenApiResponse(
                response=MeetingBookingSerializer,
                description="Meeting booking details.",
            ),
            401: OpenApiResponse(description="Unauthorized"),
            403: OpenApiResponse(description="Forbidden"),
            404: OpenApiResponse(description="Not Found"),
        },
    )
    def get(self, request, pk, *args, **kwargs):
        booking = self.get_object(pk)
        serializer = MeetingBookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update Meeting Booking",
        description="Updates meeting details like meeting_date or meeting_time. Restricted to meeting owner or Admins.",
        tags=["Meetings"],
        request=MeetingBookingSerializer,
        operation_id="update_meeting",
        responses={
            200: OpenApiResponse(
                response=MeetingBookingSerializer,
                description="Meeting booking updated successfully.",
            ),
            400: OpenApiResponse(description="Validation Failure."),
            401: OpenApiResponse(description="Unauthorized"),
            403: OpenApiResponse(description="Forbidden"),
            404: OpenApiResponse(description="Not Found"),
        },
    )
    def put(self, request, pk, *args, **kwargs):
        booking = self.get_object(pk)
        serializer = MeetingBookingSerializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_booking = MeetingService.update_meeting(
            booking, serializer.validated_data
        )
        response_serializer = MeetingBookingSerializer(updated_booking)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
