from django.urls import path
from . import views

urlpatterns = [
    path('<int:pk>/vote/', views.vote_comment, name='comment-vote'),
]
