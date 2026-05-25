from rest_framework import serializers
from .models import StudyGroup, GroupMembership
from apps.users.serializers import UserMiniSerializer


class GroupMembershipSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = GroupMembership
        fields = ['id', 'user', 'role', 'joined_at']


class StudyGroupSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = StudyGroup
        fields = [
            'id', 'name', 'description', 'course_code', 'category',
            'is_private', 'max_members', 'invite_code', 'created_by',
            'member_count', 'is_member', 'user_role', 'avatar_color',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'invite_code', 'created_by', 'created_at', 'updated_at']

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.memberships.filter(user=request.user).exists()
        return False

    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            return membership.role if membership else None
        return None


class StudyGroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = ['name', 'description', 'course_code', 'category', 'is_private', 'max_members', 'avatar_color']

    def create(self, validated_data):
        group = StudyGroup.objects.create(
            created_by=self.context['request'].user,
            **validated_data,
        )
        GroupMembership.objects.create(user=self.context['request'].user, group=group, role='admin')
        return group
