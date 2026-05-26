from django.urls import path
from . import views

urlpatterns = [
    path('<int:group_id>/messages/', views.MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/react/', views.MessageReactView.as_view(), name='message-react'),
]
