from django.urls import path
from . import views

urlpatterns = [
    path('<int:group_id>/messages/', views.MessageHistoryView.as_view(), name='message-history'),
    path('messages/<int:pk>/react/', views.MessageReactView.as_view(), name='message-react'),
]
