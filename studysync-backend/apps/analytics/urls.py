from django.urls import path
from . import views

urlpatterns = [
    path('streak/', views.StreakView.as_view(), name='analytics-streak'),
    path('study-hours/', views.StudyHoursView.as_view(), name='analytics-hours'),
    path('subjects/', views.SubjectBreakdownView.as_view(), name='analytics-subjects'),
    path('heatmap/', views.HeatmapView.as_view(), name='analytics-heatmap'),
    path('grades/', views.CourseGradeListCreateView.as_view(), name='grade-list'),
    path('grades/<int:pk>/', views.CourseGradeDetailView.as_view(), name='grade-detail'),
]
