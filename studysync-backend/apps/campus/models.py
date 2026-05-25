from django.db import models


class StudySpot(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    location = models.CharField(max_length=300)
    capacity = models.PositiveIntegerField(default=20)
    amenities = models.JSONField(default=list)
    rating = models.FloatField(default=4.0)
    image_url = models.URLField(blank=True, default='')
    is_open_24h = models.BooleanField(default=False)
    hours = models.CharField(max_length=100, blank=True, default='9am - 10pm')
    noise_level = models.CharField(max_length=20, choices=[
        ('silent', 'Silent'), ('quiet', 'Quiet'), ('moderate', 'Moderate')
    ], default='quiet')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_spots'

    def __str__(self):
        return self.name
