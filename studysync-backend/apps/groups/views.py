from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.shortcuts import get_object_or_404
from .models import StudyGroup, GroupMembership, Whiteboard, WhiteboardSnapshot
from .serializers import StudyGroupSerializer, StudyGroupCreateSerializer, GroupMembershipSerializer
from .filters import StudyGroupFilter


class StudyGroupListCreateView(generics.ListCreateAPIView):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = StudyGroupFilter
    search_fields = ['name', 'description', 'course_code']
    ordering_fields = ['created_at', 'member_count']

    def get_queryset(self):
        return StudyGroup.objects.annotate(member_count=Count('memberships')).filter(is_private=False)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StudyGroupCreateSerializer
        return StudyGroupSerializer

    def create(self, request, *args, **kwargs):
        serializer = StudyGroupCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(StudyGroupSerializer(group, context={'request': request}).data, status=status.HTTP_201_CREATED)


class StudyGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudyGroupSerializer

    def get_queryset(self):
        return StudyGroup.objects.annotate(member_count=Count('memberships'))

    def get_serializer_context(self):
        return {'request': self.request}


class MyGroupsView(generics.ListAPIView):
    serializer_class = StudyGroupSerializer

    def get_queryset(self):
        return StudyGroup.objects.filter(memberships__user=self.request.user).annotate(member_count=Count('memberships'))

    def get_serializer_context(self):
        return {'request': self.request}


class JoinGroupView(APIView):
    def post(self, request, pk):
        try:
            group = StudyGroup.objects.get(pk=pk)
        except StudyGroup.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        if GroupMembership.objects.filter(user=request.user, group=group).exists():
            return Response({'error': 'Already a member'}, status=status.HTTP_400_BAD_REQUEST)
        if group.memberships.count() >= group.max_members:
            return Response({'error': 'Group is full'}, status=status.HTTP_400_BAD_REQUEST)
        GroupMembership.objects.create(user=request.user, group=group, role='member')
        return Response({'message': 'Joined successfully'})


class LeaveGroupView(APIView):
    def post(self, request, pk):
        GroupMembership.objects.filter(user=request.user, group_id=pk).delete()
        return Response({'message': 'Left group'})


class GroupMembersView(generics.ListAPIView):
    serializer_class = GroupMembershipSerializer

    def get_queryset(self):
        return GroupMembership.objects.filter(group_id=self.kwargs['pk']).select_related('user', 'user__profile')


class WhiteboardView(APIView):
    def _track_viewer(self, wb, user):
        from django.utils import timezone
        now = timezone.now().isoformat()
        viewers = [v for v in (wb.active_viewers or [])
                   if v.get('id') != user.id and
                   (timezone.now() - timezone.datetime.fromisoformat(v['last_seen'].replace('Z', '+00:00'))).seconds < 30]
        viewers.append({'id': user.id, 'name': f"{user.first_name} {user.last_name}".strip() or user.email, 'last_seen': now})
        wb.active_viewers = viewers

    def get(self, request, pk):
        group = get_object_or_404(StudyGroup, pk=pk)
        wb, _ = Whiteboard.objects.get_or_create(group=group)
        self._track_viewer(wb, request.user)
        wb.save(update_fields=['active_viewers'])
        editor = None
        if wb.updated_by:
            editor = {'id': wb.updated_by.id, 'name': f"{wb.updated_by.first_name} {wb.updated_by.last_name}".strip()}
        return Response({
            'state': wb.state,
            'updated_at': wb.updated_at.isoformat(),
            'updated_by': editor,
            'active_viewers': wb.active_viewers,
        })

    def put(self, request, pk):
        group = get_object_or_404(StudyGroup, pk=pk)
        if not GroupMembership.objects.filter(user=request.user, group=group).exists():
            return Response({'error': 'Must be a group member'}, status=403)
        wb, _ = Whiteboard.objects.get_or_create(group=group)
        wb.state = request.data.get('state', {})
        wb.updated_by = request.user
        self._track_viewer(wb, request.user)
        wb.save()
        return Response({'updated_at': wb.updated_at.isoformat()})


class WhiteboardSnapshotView(APIView):
    def _get_wb(self, pk):
        group = get_object_or_404(StudyGroup, pk=pk)
        wb, _ = Whiteboard.objects.get_or_create(group=group)
        return wb

    def get(self, request, pk):
        wb = self._get_wb(pk)
        snaps = wb.snapshots.select_related('created_by').all()[:20]
        return Response([{
            'id': s.id, 'name': s.name,
            'created_at': s.created_at.isoformat(),
            'created_by': f"{s.created_by.first_name} {s.created_by.last_name}".strip() if s.created_by else '',
        } for s in snaps])

    def post(self, request, pk):
        wb = self._get_wb(pk)
        name = request.data.get('name', '').strip()
        state = request.data.get('state')
        if not name or not state:
            return Response({'error': 'name and state required'}, status=400)
        snap = WhiteboardSnapshot.objects.create(whiteboard=wb, name=name, state=state, created_by=request.user)
        return Response({'id': snap.id, 'name': snap.name, 'created_at': snap.created_at.isoformat()}, status=201)


class WhiteboardSnapshotDetailView(APIView):
    def delete(self, request, pk, snap_id):
        snap = get_object_or_404(WhiteboardSnapshot, id=snap_id, whiteboard__group_id=pk)
        snap.delete()
        return Response(status=204)

    def post(self, request, pk, snap_id):
        snap = get_object_or_404(WhiteboardSnapshot, id=snap_id, whiteboard__group_id=pk)
        wb = snap.whiteboard
        wb.state = snap.state
        wb.updated_by = request.user
        wb.save()
        return Response({'state': snap.state, 'updated_at': wb.updated_at.isoformat()})
