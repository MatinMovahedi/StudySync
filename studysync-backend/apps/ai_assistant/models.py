from django.db import models
from django.conf import settings


class AIConversation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_conversations')
    title = models.CharField(max_length=200, default='New Conversation')
    messages = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_conversations'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} — {self.title}"


class FlashCard(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='flashcards')
    deck_name = models.CharField(max_length=200)
    front = models.TextField()
    back = models.TextField()
    ai_generated = models.BooleanField(default=True)
    ease_factor = models.FloatField(default=2.5)
    interval_days = models.IntegerField(default=1)
    next_review = models.DateTimeField(null=True, blank=True)
    review_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'flashcards'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.front[:60]} ({self.deck_name})"


class StudyPlan(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_plans')
    week_start = models.DateField()
    goal       = models.TextField(blank=True, default='')
    plan_data  = models.JSONField(default=list)
    # [{day: 'Monday', subject: 'CS401', duration_min: 60, task: 'Review DP patterns', priority: 'high'}]
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_plans'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} plan starting {self.week_start}"
