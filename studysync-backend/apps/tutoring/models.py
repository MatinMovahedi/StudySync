from django.db import models
from django.conf import settings


class TutorListing(models.Model):
    tutor        = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tutor_listing')
    subjects     = models.JSONField(default=list)
    bio          = models.TextField()
    availability = models.TextField()
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tutor_listings'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.tutor.email} — tutor listing'


class TutoringRequest(models.Model):
    STATUS = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    requester  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tutoring_requests_sent')
    listing    = models.ForeignKey(TutorListing, on_delete=models.CASCADE, related_name='requests')
    message    = models.TextField()
    status     = models.CharField(max_length=20, choices=STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tutoring_requests'
        unique_together = ('requester', 'listing')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.requester.email} → {self.listing.tutor.email}'
