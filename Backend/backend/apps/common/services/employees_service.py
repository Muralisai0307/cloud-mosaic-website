import datetime
import logging
from django.db import transaction
from django.db.models import Sum
from rest_framework.exceptions import ValidationError

from apps.employees.models import (
    EmployeeProfile,
    Attendance,
    LeaveRequest,
    Project,
    Task,
    TaskComment,
    Timesheet,
    EmployeeDocument,
    Notification,
    EmployeeSettings,
)
from apps.meetings.models import MeetingBooking

logger = logging.getLogger("auth")


class EmployeesService:
    """
    Central service layer managing all Employee Portal dashboard operations,
    attendance tracking, leave workflows, timesheets, and task allocations.
    """

    @staticmethod
    def get_dashboard(user):
        """
        Gathers profile metrics, leave levels, task queues, and attendance history.
        """
        logger.info(f"Assembling Employee Portal Dashboard for: {user.username}")

        # 1. Profile Completion Percentage
        profile = EmployeeProfile.objects.filter(user=user).first()
        completion = 0
        if profile:
            completion += 20 if user.get_full_name().strip() else 0
            completion += 10 if profile.phone else 0
            completion += 10 if profile.date_of_birth else 0
            completion += 10 if profile.address else 0
            completion += 10 if len(profile.skills) > 0 else 0
            completion += 10 if len(profile.experience) > 0 else 0
            completion += 10 if len(profile.education) > 0 else 0
            completion += 10 if len(profile.emergency_contact) > 0 else 0
            completion += 10 if profile.profile_image else 0

        # 2. Project counts
        current_projects = Project.objects.filter(members=user, status="Active")

        # 3. Tasks counts
        assigned_tasks = Task.objects.filter(assigned_employee=user)
        pending_tasks = assigned_tasks.exclude(status="Completed")

        # 4. Attendance summary (present count this month)
        today = datetime.date.today()
        month_start = today.replace(day=1)
        attendance_present = Attendance.objects.filter(
            employee=user, date__gte=month_start, status="Present"
        ).count()

        # 5. Leave Balances (Total baseline 20 days minus approved days)
        approved_leaves_duration = LeaveRequest.objects.filter(
            employee=user, status="Approved"
        )
        taken_days = 0
        for req in approved_leaves_duration:
            taken_days += (req.end_date - req.start_date).days + 1
        leave_balance = max(0, 20 - taken_days)

        # 6. Notifications
        notifications = Notification.objects.filter(user=user, is_read=False)[:5]

        # 7. Upcoming Meetings
        meetings = MeetingBooking.objects.filter(
            email=user.email, meeting_date__gte=today
        ).order_by("meeting_date", "meeting_time")[:3]

        # 8. Timesheets Status
        recent_timesheets = Timesheet.objects.filter(employee=user).order_by("-date")[:5]

        return {
            "employee_name": user.get_full_name() or user.username,
            "profile_completion_percentage": completion,
            "current_projects": [proj.name for proj in current_projects],
            "assigned_tasks_count": assigned_tasks.count(),
            "pending_tasks_count": pending_tasks.count(),
            "attendance_summary_present_days": attendance_present,
            "leave_balance_days": leave_balance,
            "recent_notifications": [
                {"id": n.id, "title": n.title, "message": n.message} for n in notifications
            ],
            "upcoming_meetings": [
                {"date": str(m.meeting_date), "time": str(m.meeting_time), "service": m.service}
                for m in meetings
            ],
            "timesheet_status": [
                {"date": str(ts.date), "hours": float(ts.hours_worked), "status": ts.status}
                for ts in recent_timesheets
            ],
        }

    @staticmethod
    def check_in(user):
        """
        Locks check-ins to once a day.
        """
        today = datetime.date.today()
        now_time = datetime.datetime.now().time()

        if Attendance.objects.filter(employee=user, date=today).exists():
            logger.warning(f"Double check-in attempt by user '{user.username}' on {today}")
            raise ValidationError("You have already checked in today.")

        with transaction.atomic():
            attendance = Attendance.objects.create(
                employee=user,
                date=today,
                check_in=now_time,
                status="Present",
            )
            logger.info(f"Successful check-in for '{user.username}' at {now_time}")
            
            # Dispatch real-time alert notification
            EmployeesService.create_notification(
                user=user,
                title="Checked In Successfully",
                message=f"You successfully checked in today at {now_time.strftime('%H:%M')}."
            )
        return attendance

    @staticmethod
    def check_out(user):
        """
        Updates today's check-out details and working hours.
        """
        today = datetime.date.today()
        now_time = datetime.datetime.now().time()

        attendance = Attendance.objects.filter(employee=user, date=today).first()
        if not attendance:
            logger.warning(f"Check-out attempted without check-in by user '{user.username}'")
            raise ValidationError("You must check in before checking out.")

        if attendance.check_out is not None:
            logger.warning(f"Double check-out attempt by user '{user.username}'")
            raise ValidationError("You have already checked out today.")

        with transaction.atomic():
            attendance.check_out = now_time
            # Calculate working hours
            in_dt = datetime.datetime.combine(today, attendance.check_in)
            out_dt = datetime.datetime.combine(today, now_time)
            duration_hours = (out_dt - in_dt).seconds / 3600.0
            attendance.working_hours = round(duration_hours, 2)
            attendance.save()
            logger.info(f"Successful check-out for '{user.username}' working {duration_hours:.2f} hours.")
            
            # Dispatch alert notification
            EmployeesService.create_notification(
                user=user,
                title="Checked Out Successfully",
                message=f"You checked out today at {now_time.strftime('%H:%M')}. Working hours: {attendance.working_hours}."
            )
        return attendance

    @staticmethod
    def apply_leave(user, data):
        """
        Validates date order and creates leave request.
        """
        start = data.get("start_date")
        end = data.get("end_date")

        if end < start:
            raise ValidationError("Leave end date cannot precede the start date.")

        with transaction.atomic():
            request = LeaveRequest.objects.create(
                employee=user,
                leave_type=data.get("leave_type"),
                start_date=start,
                end_date=end,
                reason=data.get("reason"),
                status="Pending",
            )
            logger.info(f"Leave applied by user '{user.username}': {request.leave_type}")
        return request

    @staticmethod
    def approve_leave(leave_id, status_value):
        """
        Approves or rejects a leave request.
        """
        request = LeaveRequest.objects.filter(pk=leave_id).first()
        if not request:
            raise ValidationError("Leave request not found.")

        with transaction.atomic():
            request.status = status_value
            request.save()
            logger.info(f"Leave request {leave_id} marked as {status_value}")

            # Notify user
            EmployeesService.create_notification(
                user=request.employee,
                title=f"Leave {status_value}",
                message=f"Your request for {request.leave_type} starting on {request.start_date} has been {status_value.lower()}."
            )
        return request

    @staticmethod
    def submit_timesheet(user, data):
        """
        Saves weekly timesheet log details.
        """
        with transaction.atomic():
            timesheet = Timesheet.objects.create(
                employee=user,
                project=data.get("project"),
                task=data.get("task"),
                date=data.get("date"),
                hours_worked=data.get("hours_worked"),
                description=data.get("description"),
                status="Submitted",
            )
            logger.info(f"Timesheet submitted by '{user.username}' for project '{timesheet.project.name}'")
        return timesheet

    @staticmethod
    def approve_timesheet(timesheet_id, status_value):
        """
        Approves or rejects a timesheet entry.
        """
        timesheet = Timesheet.objects.filter(pk=timesheet_id).first()
        if not timesheet:
            raise ValidationError("Timesheet record not found.")

        with transaction.atomic():
            timesheet.status = status_value
            timesheet.save()
            logger.info(f"Timesheet {timesheet_id} marked as {status_value}")
        return timesheet

    @staticmethod
    def create_notification(user, title, message):
        """
        Utility function to generate notifications.
        """
        return Notification.objects.create(user=user, title=title, message=message)
