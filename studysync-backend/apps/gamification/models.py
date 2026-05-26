from django.db import models
from django.conf import settings


class GamificationProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gamification_profile',
    )
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    achievements = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'gamification_profiles'

    def __str__(self):
        return f'{self.user.email} — Level {self.level} ({self.xp} XP)'

    def award_xp(self, amount: int) -> bool:
        from .achievements import xp_to_level
        self.xp += amount
        new_level = xp_to_level(self.xp)
        leveled_up = new_level > self.level
        self.level = new_level
        self.save(update_fields=['xp', 'level', 'updated_at'])
        return leveled_up

    def unlock_achievement(self, achievement_id: str) -> bool:
        if achievement_id in self.achievements:
            return False
        self.achievements = list(self.achievements) + [achievement_id]
        self.save(update_fields=['achievements', 'updated_at'])
        return True
