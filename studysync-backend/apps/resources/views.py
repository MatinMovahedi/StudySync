from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Resource, ResourceVote, ResourceSave
from .serializers import ResourceSerializer


class ResourceListCreateView(generics.ListCreateAPIView):
    serializer_class = ResourceSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'tags']

    def get_queryset(self):
        qs = Resource.objects.select_related('created_by')
        category = self.request.query_params.get('category')
        tag = self.request.query_params.get('tag')
        sort = self.request.query_params.get('sort', 'top')
        saved = self.request.query_params.get('saved')
        if category:
            qs = qs.filter(category=category)
        if tag:
            qs = qs.filter(tags__contains=[tag])
        if saved == 'true' and self.request.user.is_authenticated:
            qs = qs.filter(saves__user=self.request.user)
        if sort == 'new':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('-upvotes', '-created_at')
        return qs


class ResourceDetailView(generics.RetrieveAPIView):
    serializer_class = ResourceSerializer
    queryset = Resource.objects.select_related('created_by')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_resource(request, pk):
    resource = generics.get_object_or_404(Resource, pk=pk)
    vote, created = ResourceVote.objects.get_or_create(resource=resource, user=request.user)
    if not created:
        vote.delete()
        resource.refresh_from_db()
        return Response({'voted': False, 'upvotes': resource.upvotes})
    resource.refresh_from_db()
    return Response({'voted': True, 'upvotes': resource.upvotes})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_resource(request, pk):
    resource = generics.get_object_or_404(Resource, pk=pk)
    save, created = ResourceSave.objects.get_or_create(resource=resource, user=request.user)
    if not created:
        save.delete()
        return Response({'saved': False})
    return Response({'saved': True})
