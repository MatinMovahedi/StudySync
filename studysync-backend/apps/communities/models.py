from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

CATEGORY_CHOICES = [
    ('course', 'Course'),
    ('department', 'Department'),
    ('general', 'General'),
    ('resources', 'Resources'),
    ('events', 'Events'),
]

POST_TYPES = [
    ('question', 'Question'),
    ('discussion', 'Discussion'),
    ('resource', 'Resource'),
    ('announcement', 'Announcement'),
]


class Community(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=8, default='📚')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_communities')
    member_count = models.PositiveIntegerField(default=0)
    post_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-member_count']
        verbose_name_plural = 'communities'

    def __str__(self):
        return self.name


class CommunityMembership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_memberships')
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'community')


class Post(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='community_posts')
    title = models.CharField(max_length=300)
    body = models.TextField(blank=True)
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='discussion')
    is_anonymous = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    hot_score = models.FloatField(default=0.0)
    comment_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-hot_score']

    def __str__(self):
        return self.title


class PostVote(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_votes')
    value = models.SmallIntegerField()  # +1 or -1

    class Meta:
        unique_together = ('post', 'user')


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='community_comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    body = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', 'created_at']

    def __str__(self):
        return f'Comment by {self.author_id} on {self.post_id}'


class CommentVote(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_votes')
    value = models.SmallIntegerField()  # +1 or -1

    class Meta:
        unique_together = ('comment', 'user')


class SavedPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_posts')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')
        ordering = ['-saved_at']


class WikiPage(models.Model):
    community  = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='wiki_pages')
    slug       = models.SlugField(max_length=100)
    title      = models.CharField(max_length=200)
    content    = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='wiki_pages_created')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='wiki_pages_updated')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('community', 'slug')
        ordering = ['title']

    def __str__(self):
        return f'{self.community.slug}/{self.slug}'
