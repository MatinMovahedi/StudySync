from rest_framework import serializers
from .models import StudySpot


class StudySpotSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySpot
        fields = '__all__'
