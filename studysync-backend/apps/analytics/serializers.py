from rest_framework import serializers
from .models import StudyStreak, DailyStudyLog, CourseGrade


class StudyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyStreak
        exclude = ['user']


class DailyStudyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStudyLog
        exclude = ['user']


class CourseGradeSerializer(serializers.ModelSerializer):
    weighted_average = serializers.SerializerMethodField()

    class Meta:
        model = CourseGrade
        fields = ['id', 'course_name', 'target_grade', 'assessments', 'weighted_average', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_weighted_average(self, obj):
        assessments = obj.assessments or []
        if not assessments:
            return None
        total_weight = sum(a.get('weight', 0) for a in assessments)
        if total_weight == 0:
            return None
        weighted_sum = sum(
            (a.get('score', 0) / a.get('max_score', 1)) * a.get('weight', 0)
            for a in assessments
            if a.get('max_score', 0) > 0
        )
        return round((weighted_sum / total_weight) * 100, 1)
