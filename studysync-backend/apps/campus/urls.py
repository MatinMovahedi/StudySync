from django.urls import path
from . import views

urlpatterns = [
    path('spots/', views.StudySpotListView.as_view(), name='spots-list'),
    path('spots/<int:pk>/', views.StudySpotDetailView.as_view(), name='spots-detail'),
]
