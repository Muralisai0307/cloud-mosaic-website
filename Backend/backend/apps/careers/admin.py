from django.contrib import admin
from apps.careers.models import Job, JobApplication


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "department", "location", "is_active", "created_at")
    list_filter = ("is_active", "department", "location")
    search_fields = ("title", "department", "description")
    readonly_fields = ("created_at",)


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "job", "applied_at")
    list_filter = ("job", "applied_at")
    search_fields = ("full_name", "email", "job__title", "cover_letter")
    readonly_fields = ("applied_at",)
