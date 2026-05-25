from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_message', 'New Message'),
        ('session_reminder', 'Session Reminder'),
        ('group_invite', 'Group Invite'),
        ('group_join', 'Group Join'),
        ('session_created', 'Session Created'),
        ('streak_milestone', 'Streak Milestone'),
        ('ai_response', 'AI Response'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True, default='')
    is_read = models.BooleanField(default=False)
    related_object_id = models.IntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} for {self.user.email}"
