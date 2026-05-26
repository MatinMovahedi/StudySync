from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, date
from .models import StudyStreak, DailyStudyLog, CourseGrade
from .serializers import CourseGradeSerializer
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
        return Response({'breakdown': data})


class HeatmapView(APIView):
    def get(self, request):
        today = timezone.now().date()
        start_date = today - timedelta(days=364)
        logs = DailyStudyLog.objects.filter(user=request.user, date__gte=start_date)
        log_map = {log.date: log.minutes_studied for log in logs}
        data = []
        for i in range(365):
            d = start_date + timedelta(days=i)
            minutes = log_map.get(d, 0)
            if minutes == 0:
                intensity = 0
            elif minutes <= 30:
                intensity = 1
            elif minutes <= 60:
                intensity = 2
            elif minutes <= 120:
                intensity = 3
            else:
                intensity = 4
            data.append({'date': d.isoformat(), 'minutes': minutes, 'intensity': intensity})
        return Response({'data': data})


class CourseGradeListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseGradeSerializer

    def get_queryset(self):
        return CourseGrade.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CourseGradeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseGradeSerializer

    def get_queryset(self):
        return CourseGrade.objects.filter(user=self.request.user)
