from rest_framework import serializers
from .models import Message
from apps.users.serializers import UserMiniSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'group', 'sender', 'content', 'message_type', 'file_url', 'file_name', 'reactions', 'reply_to', 'is_edited', 'created_at', 'updated_at']
        read_only_fields = ['id', 'sender', 'created_at', 'updated_at']
