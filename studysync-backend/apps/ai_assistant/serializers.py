from rest_framework import serializers
from .models import AIConversation, FlashCard, StudyPlan


class AIConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConversation
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class FlashCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlashCard
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


class StudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = ['id', 'week_start', 'goal', 'plan_data', 'created_at']
        read_only_fields = ['id', 'created_at']
