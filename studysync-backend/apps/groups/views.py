from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from .models import StudyGroup, GroupMembership
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
