from django.contrib import admin
from .models import StudySession, PomodoroSession


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'group', 'created_by', 'scheduled_at', 'duration_minutes', 'is_online')
    list_filter = ('is_online',)
    search_fields = ('title', 'group__name', 'created_by__email')
    readonly_fields = ('created_at',)
    ordering = ('scheduled_at',)


@admin.register(PomodoroSession)
class PomodoroSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'duration_minutes', 'subject', 'is_completed', 'started_at', 'completed_at')
    list_filter = ('is_completed',)
    search_fields = ('user__email', 'subject')
    readonly_fields = ('started_at',)
    ordering = ('-started_at',)
