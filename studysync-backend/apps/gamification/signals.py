from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from apps.sessions_app.models import PomodoroSession
from apps.groups.models import GroupMembership
from apps.analytics.models import StudyStreak
from .achievements import ACHIEVEMENTS, XP_AWARDS
from .models import GamificationProfile


def _get_or_create_profile(user):
    profile, _ = GamificationProfile.objects.get_or_create(user=user)
    return profile


@receiver(post_save, sender=PomodoroSession)
def on_pomodoro_complete(sender, instance, created, **kwargs):
    if not instance.is_completed:
        return

    profile = _get_or_create_profile(instance.user)
    profile.award_xp(XP_AWARDS['pomodoro_complete'])

    completed_count = PomodoroSession.objects.filter(
        user=instance.user, is_completed=True
    ).count()

    if completed_count == 1:
        profile.unlock_achievement('first_pomodoro')

    if completed_count >= 100:
        profile.unlock_achievement('century')

    if instance.started_at and instance.started_at.hour == 0:
        profile.unlock_achievement('night_owl')


@receiver(post_save, sender=GroupMembership)
def on_group_joined(sender, instance, created, **kwargs):
    if not created:
        return

    profile = _get_or_create_profile(instance.user)
    profile.award_xp(XP_AWARDS['group_joined'])

    if instance.role == 'admin':
        profile.unlock_achievement('group_leader')

    member_count = GroupMembership.objects.filter(user=instance.user).count()
    if member_count >= 5:
        profile.unlock_achievement('social_butterfly')


@receiver(post_save, sender=StudyStreak)
def on_streak_update(sender, instance, **kwargs):
    profile = _get_or_create_profile(instance.user)

    if instance.current_streak == 7:
        profile.award_xp(XP_AWARDS['streak_7'])
        profile.unlock_achievement('streak_7')

    if instance.current_streak == 30:
        profile.unlock_achievement('streak_30')
