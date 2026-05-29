from django.db import models
from django.conf import settings

RESOURCE_CATEGORIES = [
    ('notes', 'Notes'),
    ('cheatsheet', 'Cheat Sheet'),
    ('tutorial', 'Tutorial'),
    ('tool', 'Tool'),
    ('video', 'Video'),
    ('article', 'Article'),
    ('other', 'Other'),
]


class Resource(models.Model):
    title       = models.CharField(max_length=200)
    description = models.TextField()
    url         = models.URLField(blank=True)
    content     = models.TextField(blank=True)
    category    = models.CharField(max_length=30, choices=RESOURCE_CATEGORIES, default='other')
    tags        = models.JSONField(default=list)
    community   = models.ForeignKey('communities.Community', on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='resources')
    upvotes     = models.PositiveIntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'resources'
        ordering = ['-upvotes', '-created_at']

    def __str__(self):
        return self.title


class ResourceVote(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='votes')
    user     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resource_votes')

    class Meta:
        db_table = 'resource_votes'
        unique_together = ('resource', 'user')


class ResourceSave(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='saves')
    user     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resource_saves')

    class Meta:
        db_table = 'resource_saves'
        unique_together = ('resource', 'user')
