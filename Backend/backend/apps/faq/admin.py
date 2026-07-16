from django.contrib import admin
from apps.faq.models import FAQItem


@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ("question", "category", "is_active", "created_at")
    list_filter = ("category", "is_active", "created_at")
    search_fields = ("question", "answer", "category")
    ordering = ("category", "question")
