from django.urls import path
from . import views

urlpatterns = [
    path('', views.CommunityListCreateView.as_view(), name='community-list'),
    path('feed/', views.GlobalFeedView.as_view(), name='community-feed'),
    path('saved/', views.SavedPostsView.as_view(), name='community-saved'),
    path('<slug:slug>/', views.CommunityDetailView.as_view(), name='community-detail'),
    path('<slug:slug>/join/', views.join_community, name='community-join'),
    path('<slug:slug>/posts/', views.CommunityPostListCreateView.as_view(), name='community-posts'),
    path('<slug:slug>/wiki/', views.WikiPageListCreateView.as_view(), name='wiki-list'),
    path('<slug:slug>/wiki/<slug:page_slug>/', views.WikiPageDetailView.as_view(), name='wiki-detail'),
]
