from django.db import models


class FAQItem(models.Model):
    """
    Model representing frequently asked questions.
    """

    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=100, db_index=True, default="General")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["category", "question"]
        verbose_name = "FAQ Item"
        verbose_name_plural = "FAQ Items"

    def __str__(self):
        return f"[{self.category}] {self.question}"
