from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, date
from .models import StudyStreak, DailyStudyLog
from apps.sessions_app.models import PomodoroSession


class StreakView(APIView):
    def get(self, request):
        streak, _ = StudyStreak.objects.get_or_create(user=request.user)
        return Response({
            'current_streak': streak.current_streak,
            'longest_streak': streak.longest_streak,
            'last_study_date': streak.last_study_date,
            'total_study_days': streak.total_study_days,
        })


class StudyHoursView(APIView):
    def get(self, request):
        range_param = request.query_params.get('range', '7d')
        days = {'7d': 7, '30d': 30, '90d': 90}.get(range_param, 7)
        start_date = timezone.now().date() - timedelta(days=days)
        logs = DailyStudyLog.objects.filter(user=request.user, date__gte=start_date).order_by('date')
        log_map = {log.date: log for log in logs}
        data = []
        for i in range(days):
            d = start_date + timedelta(days=i)
            log = log_map.get(d)
            data.append({
                'date': d.isoformat(),
                'minutes': log.minutes_studied if log else 0,
                'sessions': log.sessions_completed if log else 0,
            })
        return Response({'data': data, 'total_hours': sum(d['minutes'] for d in data) / 60})


class SubjectBreakdownView(APIView):
    def get(self, request):
        sessions = PomodoroSession.objects.filter(user=request.user, is_completed=True, subject__isnull=False).exclude(subject='')
        breakdown = {}
        for s in sessions:
            subject = s.subject or 'Other'
            breakdown[subject] = breakdown.get(subject, 0) + s.duration_minutes
        data = [{'subject': k, 'minutes': v} for k, v in breakdown.items()]
        if not data:
            data = [
                {'subject': 'Computer Science', 'minutes': 120},
                {'subject': 'Mathematics', 'minutes': 90},
                {'subject': 'Physics', 'minutes': 60},
                {'subject': 'English', 'minutes': 45},
            ]
        return Response({'breakdown': data})
