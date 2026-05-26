from django.contrib import admin
from .models import StudySpot


@admin.register(StudySpot)
class StudySpotAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'capacity', 'noise_level', 'rating', 'is_open_24h')
    list_filter = ('noise_level', 'is_open_24h')
    search_fields = ('name', 'location')
    ordering = ('-rating',)
