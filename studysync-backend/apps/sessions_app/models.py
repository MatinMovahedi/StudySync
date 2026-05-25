from django.db import models
from django.conf import settings


class StudySession(models.Model):
    group = models.ForeignKey('groups.StudyGroup', on_delete=models.CASCADE, related_name='sessions')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_sessions')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    location = models.CharField(max_length=300, blank=True, default='')
    is_online = models.BooleanField(default=True)
    join_link = models.URLField(blank=True, default='')
    max_participants = models.PositiveSmallIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_sessions'
        ordering = ['scheduled_at']

    def __str__(self):
        return self.title


class PomodoroSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pomodoro_sessions')
    duration_minutes = models.PositiveIntegerField(default=25)
    is_completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    subject = models.CharField(max_length=100, blank=True, default='')
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'pomodoro_sessions'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.email} Pomodoro - {self.started_at.date()}"
