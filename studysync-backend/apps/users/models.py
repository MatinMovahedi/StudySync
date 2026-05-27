from django.contrib.auth.models import AbstractUser
from django.db import models


STUDY_STYLE_CHOICES = [
    ('early_bird', 'Early Bird'),
    ('night_owl', 'Night Owl'),
    ('pomodoro', 'Pomodoro Lover'),
    ('group_learner', 'Group Learner'),
    ('solo_studier', 'Solo Studier'),
    ('visual', 'Visual Learner'),
    ('auditory', 'Auditory Learner'),
]

AVAILABILITY_CHOICES = [
    ('morning', 'Morning (6am-12pm)'),
    ('afternoon', 'Afternoon (12pm-6pm)'),
    ('evening', 'Evening (6pm-10pm)'),
    ('night', 'Night (10pm-2am)'),
    ('flexible', 'Flexible'),
]


class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_onboarded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    university = models.CharField(max_length=200, blank=True, default='')
    program = models.CharField(max_length=200, blank=True, default='')
    year_of_study = models.PositiveSmallIntegerField(null=True, blank=True)
    courses = models.JSONField(default=list, blank=True)
    study_style_tags = models.JSONField(default=list, blank=True)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, blank=True, default='flexible')
    website = models.URLField(blank=True, default='')
    github = models.CharField(max_length=100, blank=True, default='')
    total_study_hours = models.FloatField(default=0.0)
    total_sessions = models.IntegerField(default=0)
    # Portfolio
    skills   = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    linkedin = models.CharField(max_length=100, blank=True, default='')
    # Preferences
    email_digest_enabled = models.BooleanField(default=True)
    # 2FA
    totp_secret    = models.CharField(max_length=64, blank=True, default='')
    two_fa_enabled = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"{self.user.email} Profile"


class UserFollow(models.Model):
    follower  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_set')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers_set')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_follows'
        unique_together = ('follower', 'following')
