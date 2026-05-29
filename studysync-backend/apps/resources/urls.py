from django.urls import path
from . import views

urlpatterns = [
    path('', views.ResourceListCreateView.as_view(), name='resource-list'),
    path('<int:pk>/', views.ResourceDetailView.as_view(), name='resource-detail'),
    path('<int:pk>/vote/', views.vote_resource, name='resource-vote'),
    path('<int:pk>/save/', views.save_resource, name='resource-save'),
]
