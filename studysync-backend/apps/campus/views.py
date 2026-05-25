from rest_framework import generics
from .models import StudySpot
from .serializers import StudySpotSerializer


class StudySpotListView(generics.ListAPIView):
    queryset = StudySpot.objects.all().order_by('-rating')
    serializer_class = StudySpotSerializer
    permission_classes = []


class StudySpotDetailView(generics.RetrieveAPIView):
    queryset = StudySpot.objects.all()
    serializer_class = StudySpotSerializer
