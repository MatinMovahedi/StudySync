from django.contrib import admin
from .models import StudyStreak, DailyStudyLog


@admin.register(StudyStreak)
class StudyStreakAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_streak', 'longest_streak', 'last_study_date', 'total_study_days')
    search_fields = ('user__email',)
    readonly_fields = ('updated_at',)
    ordering = ('-current_streak',)


@admin.register(DailyStudyLog)
class DailyStudyLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'minutes_studied', 'sessions_completed')
    search_fields = ('user__email',)
    ordering = ('-date',)
