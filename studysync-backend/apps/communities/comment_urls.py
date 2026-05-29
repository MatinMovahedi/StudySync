from django.urls import path
from . import views

urlpatterns = [
    path('<int:pk>/vote/', views.vote_comment, name='comment-vote'),
    path('<int:pk>/delete/', views.CommentDeleteView.as_view(), name='comment-delete'),
]
