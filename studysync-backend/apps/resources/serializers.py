from rest_framework import serializers
from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    user_voted = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = ['id', 'title', 'description', 'url', 'content', 'category', 'tags',
                  'community', 'upvotes', 'created_by_name', 'user_voted', 'is_saved', 'created_at']
        read_only_fields = ['upvotes', 'created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f'{obj.created_by.first_name} {obj.created_by.last_name}'.strip() or obj.created_by.username
        return None

    def get_user_voted(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.votes.filter(user=request.user).exists()

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.saves.filter(user=request.user).exists()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
