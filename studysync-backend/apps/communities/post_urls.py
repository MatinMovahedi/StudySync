from django.urls import path
from . import views

urlpatterns = [
    path('<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('<int:pk>/delete/', views.PostDeleteView.as_view(), name='post-delete'),
    path('<int:pk>/vote/', views.vote_post, name='post-vote'),
    path('<int:pk>/save/', views.save_post, name='post-save'),
    path('<int:pk>/comments/', views.PostCommentListCreateView.as_view(), name='post-comments'),
]
