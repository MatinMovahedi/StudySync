from rest_framework import serializers
from .models import Community, Post, Comment, CommunityMembership, SavedPost, WikiPage


class CommunitySerializer(serializers.ModelSerializer):
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = ['id', 'name', 'slug', 'description', 'icon', 'category',
                  'member_count', 'post_count', 'is_member', 'created_at']
        read_only_fields = ['member_count', 'post_count', 'created_at']

    def get_is_member(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.memberships.filter(user=request.user).exists()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AuthorField(serializers.SerializerMethodField):
    pass


def _masked_author(obj, request):
    if obj.is_anonymous and request and request.user != obj.author:
        return {'id': None, 'username': 'Anonymous Student', 'first_name': 'Anonymous', 'last_name': 'Student', 'avatar': None}
    if obj.author:
        profile = getattr(obj.author, 'profile', None)
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'first_name': obj.author.first_name,
            'last_name': obj.author.last_name,
            'avatar': profile.avatar.url if profile and profile.avatar else None,
        }
    return {'id': None, 'username': '[deleted]', 'first_name': '', 'last_name': '', 'avatar': None}


class CommunityMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ['slug', 'name', 'icon']


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'body', 'is_anonymous', 'score', 'author', 'parent',
                  'replies', 'created_at', 'user_vote']
        read_only_fields = ['score', 'created_at']

    def get_author(self, obj):
        return _masked_author(obj, self.context.get('request'))

    def get_replies(self, obj):
        if obj.parent is not None:
            return []
        qs = obj.replies.all()
        return CommentSerializer(qs, many=True, context=self.context).data

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        vote = obj.votes.filter(user=request.user).first()
        return vote.value if vote else 0


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    community = CommunityMiniSerializer(read_only=True)
    user_vote = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'body', 'post_type', 'is_anonymous', 'is_pinned',
                  'score', 'hot_score', 'comment_count', 'author', 'community',
                  'created_at', 'user_vote', 'is_saved']
        read_only_fields = ['score', 'hot_score', 'comment_count', 'created_at', 'is_pinned']

    def get_author(self, obj):
        return _masked_author(obj, self.context.get('request'))

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        vote = obj.votes.filter(user=request.user).first()
        return vote.value if vote else 0

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.saved_by.filter(user=request.user).exists()

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class WikiPageSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = WikiPage
        fields = ['id', 'slug', 'title', 'content', 'created_by_name', 'updated_by_name', 'updated_at', 'created_at']
        read_only_fields = ['updated_at', 'created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f'{obj.created_by.first_name} {obj.created_by.last_name}'.strip() or obj.created_by.username
        return None

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            return f'{obj.updated_by.first_name} {obj.updated_by.last_name}'.strip() or obj.updated_by.username
        return None
