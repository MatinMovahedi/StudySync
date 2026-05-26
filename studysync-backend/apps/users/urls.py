from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/', views.MeView.as_view(), name='me'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('onboarding/', views.OnboardingView.as_view(), name='onboarding'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('2fa/setup/', views.TwoFASetupView.as_view(), name='2fa-setup'),
    path('2fa/enable/', views.TwoFAEnableView.as_view(), name='2fa-enable'),
    path('2fa/disable/', views.TwoFADisableView.as_view(), name='2fa-disable'),
]
