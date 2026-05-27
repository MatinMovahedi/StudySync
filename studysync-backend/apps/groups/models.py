from django.db import models
from django.conf import settings


GROUP_CATEGORY_CHOICES = [
    ('exam_prep', 'Exam Prep'),
    ('assignment_help', 'Assignment Help'),
    ('coding_session', 'Coding Session'),
    ('quiet_studying', 'Quiet Studying'),
    ('project_collab', 'Project Collaboration'),
    ('general', 'General Study'),
]


class StudyGroup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    course_code = models.CharField(max_length=20, blank=True, default='')
    category = models.CharField(max_length=30, choices=GROUP_CATEGORY_CHOICES, default='general')
    is_private = models.BooleanField(default=False)
    max_members = models.PositiveSmallIntegerField(default=20)
    invite_code = models.CharField(max_length=10, unique=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_groups')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through='GroupMembership', related_name='study_groups')
    avatar_color = models.CharField(max_length=7, default='#6366f1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'study_groups'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.invite_code:
            import random, string
            self.invite_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        super().save(*args, **kwargs)

class GroupMembership(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_memberships'
        unique_together = ('user', 'group')

    def __str__(self):
        return f"{self.user.email} in {self.group.name}"


class Whiteboard(models.Model):
    group = models.OneToOneField(StudyGroup, on_delete=models.CASCADE, related_name='whiteboard')
    state = models.JSONField(default=dict)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    active_viewers = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'whiteboards'

    def __str__(self):
        return f"Whiteboard for {self.group.name}"


class WhiteboardSnapshot(models.Model):
    whiteboard = models.ForeignKey(Whiteboard, on_delete=models.CASCADE, related_name='snapshots')
    name = models.CharField(max_length=100)
    state = models.JSONField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'whiteboard_snapshots'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.whiteboard.group.name}"
