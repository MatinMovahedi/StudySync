from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/', views.MeView.as_view(), name='me'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('onboarding/', views.OnboardingView.as_view(), name='onboarding'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]
