from rest_framework import serializers
from .models import GamificationProfile
from .achievements import ACHIEVEMENTS, xp_to_level, xp_for_next_level


class GamificationProfileSerializer(serializers.ModelSerializer):
    achievements_detail = serializers.SerializerMethodField()
    next_level_xp = serializers.SerializerMethodField()

    class Meta:
        model = GamificationProfile
        fields = ['xp', 'level', 'achievements', 'achievements_detail', 'next_level_xp', 'updated_at']

    def get_achievements_detail(self, obj):
        return [ACHIEVEMENTS[a] for a in obj.achievements if a in ACHIEVEMENTS]

    def get_next_level_xp(self, obj):
        return xp_for_next_level(obj.xp)


class LeaderboardEntrySerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    avatar = serializers.CharField(allow_null=True)
    xp = serializers.IntegerField()
    level = serializers.IntegerField()
    achievement_count = serializers.IntegerField()
