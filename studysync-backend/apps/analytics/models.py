from django.db import models
from django.conf import settings


class StudyStreak(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_study_date = models.DateField(null=True, blank=True)
    total_study_days = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'study_streaks'

    def __str__(self):
        return f"{self.user.email} streak: {self.current_streak}"


class DailyStudyLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_logs')
    date = models.DateField()
    minutes_studied = models.IntegerField(default=0)
    sessions_completed = models.IntegerField(default=0)
    subjects = models.JSONField(default=list)

    class Meta:
        db_table = 'daily_study_logs'
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.email} — {self.date}"


class CourseGrade(models.Model):
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_grades')
    course_name  = models.CharField(max_length=100)
    target_grade = models.CharField(max_length=5, blank=True, default='')
    assessments  = models.JSONField(default=list)
    # [{name, score, max_score, weight, type: assignment|midterm|final}]
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'course_grades'
        unique_together = ('user', 'course_name')
        ordering = ['course_name']

    def __str__(self):
        return f"{self.user.email} — {self.course_name}"
