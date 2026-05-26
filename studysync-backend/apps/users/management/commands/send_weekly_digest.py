from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User


class Command(BaseCommand):
    help = 'Send weekly study digest emails to all opted-in users'

    def handle(self, *args, **options):
        sent = skipped = 0
        week_ago = timezone.now().date() - timedelta(days=7)

        for user in User.objects.select_related('profile', 'streak').filter(is_active=True):
            profile = getattr(user, 'profile', None)
            if not profile or not profile.email_digest_enabled:
                skipped += 1
                continue

            logs = user.study_logs.filter(date__gte=week_ago)
            total_minutes = sum(l.minutes_studied for l in logs)
            total_sessions = sum(l.sessions_completed for l in logs)
            streak = getattr(user, 'streak', None)
            current_streak = streak.current_streak if streak else 0

            notifications = list(user.notifications.order_by('-created_at')[:5])
            activity_lines = '\n'.join(
                f'  • {n.message}' for n in notifications
            ) or '  No recent activity.'

            subject = f'Your StudySynch Weekly Report — {total_minutes // 60}h {total_minutes % 60}m studied'
            body = (
                f'Hi {user.first_name or user.username},\n\n'
                f'Here is your weekly study summary:\n\n'
                f'  Study time:   {total_minutes // 60}h {total_minutes % 60}m\n'
                f'  Sessions:     {total_sessions}\n'
                f'  Current streak: {current_streak} days\n\n'
                f'Recent activity:\n{activity_lines}\n\n'
                f'Keep up the great work!\n\n'
                f'— The StudySynch Team'
            )

            send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email])
            sent += 1
            self.stdout.write(f'  Sent to {user.email}')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone — sent: {sent}, skipped (opted-out or no profile): {skipped}'
        ))
