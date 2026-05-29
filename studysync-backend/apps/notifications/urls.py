from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notifications-list'),
    path('<int:pk>/read/', views.MarkReadView.as_view(), name='notification-read'),
    path('<int:pk>/delete/', views.NotificationDeleteView.as_view(), name='notification-delete'),
    path('read-all/', views.MarkAllReadView.as_view(), name='notifications-read-all'),
    path('clear/', views.NotificationClearView.as_view(), name='notifications-clear'),
]
