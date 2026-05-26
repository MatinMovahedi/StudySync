from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import GamificationProfile
from .serializers import GamificationProfileSerializer, LeaderboardEntrySerializer
from .achievements import ACHIEVEMENTS


class GamificationProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = GamificationProfile.objects.get_or_create(user=request.user)
        serializer = GamificationProfileSerializer(profile)
        all_achievements = list(ACHIEVEMENTS.values())
        return Response({
            **serializer.data,
            'all_achievements': all_achievements,
        })


class LeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profiles = (
            GamificationProfile.objects
            .select_related('user', 'user__profile')
            .order_by('-xp')[:20]
        )
        entries = []
        for rank, profile in enumerate(profiles, start=1):
            user = profile.user
            avatar_url = None
            if hasattr(user, 'profile') and user.profile.avatar:
                request_obj = self.request
                avatar_url = request_obj.build_absolute_uri(user.profile.avatar.url)
            entries.append({
                'rank': rank,
                'user_id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'avatar': avatar_url,
                'xp': profile.xp,
                'level': profile.level,
                'achievement_count': len(profile.achievements),
            })
        serializer = LeaderboardEntrySerializer(entries, many=True)
        return Response({'results': serializer.data, 'current_user_id': request.user.id})
