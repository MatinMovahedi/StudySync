from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Community, CommunityMembership, Post, PostVote, Comment, CommentVote, SavedPost, WikiPage
from .serializers import CommunitySerializer, PostSerializer, CommentSerializer, WikiPageSerializer


class CommunityListCreateView(generics.ListCreateAPIView):
    serializer_class = CommunitySerializer
    queryset = Community.objects.all()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return ctx


class CommunityDetailView(generics.RetrieveAPIView):
    serializer_class = CommunitySerializer
    queryset = Community.objects.all()
    lookup_field = 'slug'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_community(request, slug):
    community = generics.get_object_or_404(Community, slug=slug)
    membership, created = CommunityMembership.objects.get_or_create(
        user=request.user, community=community
    )
    if not created:
        membership.delete()
        return Response({'joined': False, 'member_count': community.memberships.count()})
    return Response({'joined': True, 'member_count': community.memberships.count()})


class CommunityPostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        slug = self.kwargs['slug']
        community = generics.get_object_or_404(Community, slug=slug)
        qs = Post.objects.filter(community=community).select_related('author', 'author__profile', 'community')
        sort = self.request.query_params.get('sort', 'hot')
        post_type = self.request.query_params.get('type')
        if post_type:
            qs = qs.filter(post_type=post_type)
        if sort == 'new':
            qs = qs.order_by('-is_pinned', '-created_at')
        elif sort == 'top':
            qs = qs.order_by('-is_pinned', '-score')
        else:
            qs = qs.order_by('-is_pinned', '-hot_score')
        return qs

    def perform_create(self, serializer):
        slug = self.kwargs['slug']
        community = generics.get_object_or_404(Community, slug=slug)
        serializer.save(author=self.request.user, community=community)


class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    queryset = Post.objects.select_related('author', 'author__profile', 'community')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_post(request, pk):
    post = generics.get_object_or_404(Post, pk=pk)
    value = request.data.get('value', 0)

    if value not in (1, -1, 0):
        return Response({'error': 'value must be 1, -1, or 0'}, status=status.HTTP_400_BAD_REQUEST)

    existing = PostVote.objects.filter(post=post, user=request.user).first()

    if value == 0:
        if existing:
            existing.delete()
    elif existing:
        if existing.value == value:
            existing.delete()
        else:
            existing.value = value
            existing.save()
    else:
        PostVote.objects.create(post=post, user=request.user, value=value)

    post.refresh_from_db()
    return Response({'score': post.score, 'hot_score': post.hot_score})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_post(request, pk):
    post = generics.get_object_or_404(Post, pk=pk)
    saved, created = SavedPost.objects.get_or_create(user=request.user, post=post)
    if not created:
        saved.delete()
        return Response({'saved': False})
    return Response({'saved': True})


class PostCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        post = generics.get_object_or_404(Post, pk=self.kwargs['pk'])
        return Comment.objects.filter(post=post, parent=None).select_related(
            'author', 'author__profile'
        ).prefetch_related('replies__author', 'replies__author__profile', 'replies__votes')

    def perform_create(self, serializer):
        post = generics.get_object_or_404(Post, pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, post=post)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_comment(request, pk):
    comment = generics.get_object_or_404(Comment, pk=pk)
    value = request.data.get('value', 0)

    if value not in (1, -1, 0):
        return Response({'error': 'value must be 1, -1, or 0'}, status=status.HTTP_400_BAD_REQUEST)

    existing = CommentVote.objects.filter(comment=comment, user=request.user).first()

    if value == 0:
        if existing:
            existing.delete()
    elif existing:
        if existing.value == value:
            existing.delete()
        else:
            existing.value = value
            existing.save()
    else:
        CommentVote.objects.create(comment=comment, user=request.user, value=value)

    comment.refresh_from_db()
    return Response({'score': comment.score})


class GlobalFeedView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        joined = CommunityMembership.objects.filter(user=self.request.user).values_list('community_id', flat=True)
        qs = Post.objects.filter(community_id__in=joined).select_related('author', 'author__profile', 'community')
        sort = self.request.query_params.get('sort', 'hot')
        if sort == 'new':
            return qs.order_by('-created_at')
        elif sort == 'top':
            return qs.order_by('-score')
        return qs.order_by('-hot_score')


class SavedPostsView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        saved_ids = SavedPost.objects.filter(user=self.request.user).values_list('post_id', flat=True)
        return Post.objects.filter(id__in=saved_ids).select_related('author', 'author__profile', 'community')


class WikiPageListCreateView(generics.ListCreateAPIView):
    serializer_class = WikiPageSerializer

    def get_queryset(self):
        community = generics.get_object_or_404(Community, slug=self.kwargs['slug'])
        return WikiPage.objects.filter(community=community)

    def perform_create(self, serializer):
        community = generics.get_object_or_404(Community, slug=self.kwargs['slug'])
        serializer.save(community=community, created_by=self.request.user, updated_by=self.request.user)


class WikiPageDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = WikiPageSerializer

    def get_object(self):
        community = generics.get_object_or_404(Community, slug=self.kwargs['slug'])
        return generics.get_object_or_404(WikiPage, community=community, slug=self.kwargs['page_slug'])

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
