from django.urls import path
from . import views

urlpatterns = [
    path('streak/', views.StreakView.as_view(), name='analytics-streak'),
    path('study-hours/', views.StudyHoursView.as_view(), name='analytics-hours'),
    path('subjects/', views.SubjectBreakdownView.as_view(), name='analytics-subjects'),
]
