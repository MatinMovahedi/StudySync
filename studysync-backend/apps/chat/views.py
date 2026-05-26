from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Message
from .serializers import MessageSerializer
from apps.groups.models import StudyGroup


class MessageListCreateView(generics.ListCreateAPIView):
    """GET: message history. POST: REST fallback for sending when WebSocket unavailable."""
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(
            group_id=self.kwargs['group_id']
        ).select_related('sender', 'sender__profile').order_by('created_at')

    def perform_create(self, serializer):
        group = get_object_or_404(StudyGroup, pk=self.kwargs['group_id'])
        if not group.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this group.")
        serializer.save(sender=self.request.user, group=group)


class MessageReactView(APIView):
    def post(self, request, pk):
        try:
            message = Message.objects.get(pk=pk)
        except Message.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        emoji = request.data.get('emoji', '')
        user_id = str(request.user.id)
        reactions = message.reactions or {}
        if emoji not in reactions:
            reactions[emoji] = []
        if user_id in reactions[emoji]:
            reactions[emoji].remove(user_id)
        else:
            reactions[emoji].append(user_id)
        if not reactions[emoji]:
            del reactions[emoji]
        message.reactions = reactions
        message.save(update_fields=['reactions'])
        return Response(MessageSerializer(message).data)
