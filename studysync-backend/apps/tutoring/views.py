from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import TutorListing, TutoringRequest
from .serializers import TutorListingSerializer, TutoringRequestSerializer


class TutorListingListCreateView(generics.ListCreateAPIView):
    serializer_class = TutorListingSerializer

    def get_queryset(self):
        qs = TutorListing.objects.filter(is_active=True).select_related('tutor', 'tutor__profile')
        subject = self.request.query_params.get('subject')
        if subject:
            qs = qs.filter(subjects__contains=[subject])
        return qs


class TutorListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TutorListingSerializer
    queryset = TutorListing.objects.select_related('tutor', 'tutor__profile')

    def perform_update(self, serializer):
        if self.get_object().tutor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied
        serializer.save()

    def perform_destroy(self, instance):
        if instance.tutor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied
        instance.is_active = False
        instance.save()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_tutoring(request, pk):
    listing = generics.get_object_or_404(TutorListing, pk=pk, is_active=True)
    if listing.tutor == request.user:
        return Response({'error': 'Cannot request your own listing'}, status=status.HTTP_400_BAD_REQUEST)
    tutoring_request, created = TutoringRequest.objects.get_or_create(
        requester=request.user,
        listing=listing,
        defaults={'message': request.data.get('message', '')}
    )
    if not created:
        return Response({'error': 'Already requested'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(TutoringRequestSerializer(tutoring_request).data, status=status.HTTP_201_CREATED)


class IncomingRequestsView(generics.ListAPIView):
    serializer_class = TutoringRequestSerializer

    def get_queryset(self):
        return TutoringRequest.objects.filter(
            listing__tutor=self.request.user
        ).select_related('requester', 'listing', 'listing__tutor')


class OutgoingRequestsView(generics.ListAPIView):
    serializer_class = TutoringRequestSerializer

    def get_queryset(self):
        return TutoringRequest.objects.filter(
            requester=self.request.user
        ).select_related('requester', 'listing', 'listing__tutor')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_request(request, pk):
    tutoring_request = generics.get_object_or_404(TutoringRequest, pk=pk)
    if tutoring_request.listing.tutor != request.user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    new_status = request.data.get('status')
    if new_status not in ('accepted', 'declined'):
        return Response({'error': 'status must be accepted or declined'}, status=status.HTTP_400_BAD_REQUEST)
    tutoring_request.status = new_status
    tutoring_request.save()
    return Response(TutoringRequestSerializer(tutoring_request).data)
