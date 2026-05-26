from rest_framework import serializers
from .models import StudySession, PomodoroSession
from apps.users.serializers import UserMiniSerializer


class StudySessionSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = StudySession
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        return StudySession.objects.create(created_by=self.context['request'].user, **validated_data)


class PomodoroSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PomodoroSession
        fields = '__all__'
        read_only_fields = ['id', 'user', 'started_at']
