from django.urls import path
from .views import GamificationProfileView, LeaderboardView

urlpatterns = [
    path('profile/', GamificationProfileView.as_view(), name='gamification-profile'),
    path('leaderboard/', LeaderboardView.as_view(), name='gamification-leaderboard'),
]
