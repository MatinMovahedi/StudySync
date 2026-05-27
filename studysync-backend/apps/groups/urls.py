from django.urls import path
from . import views

urlpatterns = [
    path('', views.StudyGroupListCreateView.as_view(), name='group-list'),
    path('my/', views.MyGroupsView.as_view(), name='my-groups'),
    path('<int:pk>/', views.StudyGroupDetailView.as_view(), name='group-detail'),
    path('<int:pk>/join/', views.JoinGroupView.as_view(), name='group-join'),
    path('<int:pk>/leave/', views.LeaveGroupView.as_view(), name='group-leave'),
    path('<int:pk>/members/', views.GroupMembersView.as_view(), name='group-members'),
    path('<int:pk>/whiteboard/', views.WhiteboardView.as_view(), name='whiteboard'),
    path('<int:pk>/whiteboard/snapshots/', views.WhiteboardSnapshotView.as_view(), name='whiteboard-snapshots'),
    path('<int:pk>/whiteboard/snapshots/<int:snap_id>/', views.WhiteboardSnapshotDetailView.as_view(), name='whiteboard-snapshot-detail'),
    path('<int:pk>/whiteboard/snapshots/<int:snap_id>/restore/', views.WhiteboardSnapshotDetailView.as_view(), name='whiteboard-snapshot-restore'),
]
