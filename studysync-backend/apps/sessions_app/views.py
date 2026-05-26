from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import StudySession, PomodoroSession
from .serializers import StudySessionSerializer, PomodoroSessionSerializer


class StudySessionListCreateView(generics.ListCreateAPIView):
    serializer_class = StudySessionSerializer

    def get_queryset(self):
        user_groups = self.request.user.study_groups.values_list('id', flat=True)
        return StudySession.objects.filter(group__in=user_groups, scheduled_at__gte=timezone.now()).order_by('scheduled_at')

    def get_serializer_context(self):
        return {'request': self.request}


class StudySessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudySessionSerializer

    def get_queryset(self):
        user_groups = self.request.user.study_groups.values_list('id', flat=True)
        return StudySession.objects.filter(group__in=user_groups)


class PomodoroStartView(APIView):
    def post(self, request):
        duration = request.data.get('duration_minutes', 25)
        subject = request.data.get('subject', '')
        session = PomodoroSession.objects.create(user=request.user, duration_minutes=duration, subject=subject)
        return Response(PomodoroSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class PomodoroCompleteView(APIView):
    def post(self, request, pk):
        try:
            session = PomodoroSession.objects.get(pk=pk, user=request.user)
        except PomodoroSession.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        session.is_completed = True
        session.completed_at = timezone.now()
        session.save()
        profile = request.user.profile
        profile.total_study_hours += session.duration_minutes / 60
        profile.total_sessions += 1
        profile.save(update_fields=['total_study_hours', 'total_sessions'])
        return Response(PomodoroSessionSerializer(session).data)


class PomodoroHistoryView(generics.ListAPIView):
    serializer_class = PomodoroSessionSerializer

    def get_queryset(self):
        return PomodoroSession.objects.filter(user=self.request.user, is_completed=True)
