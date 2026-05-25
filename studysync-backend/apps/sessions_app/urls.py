from django.urls import path
from . import views

urlpatterns = [
    path('', views.StudySessionListCreateView.as_view(), name='session-list'),
    path('<int:pk>/', views.StudySessionDetailView.as_view(), name='session-detail'),
    path('pomodoro/start/', views.PomodoroStartView.as_view(), name='pomodoro-start'),
    path('pomodoro/<int:pk>/complete/', views.PomodoroCompleteView.as_view(), name='pomodoro-complete'),
    path('pomodoro/history/', views.PomodoroHistoryView.as_view(), name='pomodoro-history'),
]
