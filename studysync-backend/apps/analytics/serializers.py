from rest_framework import serializers
from .models import StudyStreak, DailyStudyLog


class StudyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyStreak
        exclude = ['user']


class DailyStudyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStudyLog
        exclude = ['user']
