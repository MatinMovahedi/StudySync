from rest_framework import serializers
from .models import TutorListing, TutoringRequest


class TutorListingSerializer(serializers.ModelSerializer):
    tutor_name   = serializers.SerializerMethodField()
    tutor_avatar = serializers.SerializerMethodField()

    class Meta:
        model = TutorListing
        fields = ['id', 'tutor_name', 'tutor_avatar', 'subjects', 'bio', 'availability', 'is_active', 'created_at']
        read_only_fields = ['is_active', 'created_at']

    def get_tutor_name(self, obj):
        return f'{obj.tutor.first_name} {obj.tutor.last_name}'.strip() or obj.tutor.username

    def get_tutor_avatar(self, obj):
        profile = getattr(obj.tutor, 'profile', None)
        if profile and profile.avatar:
            return profile.avatar.url
        return None

    def create(self, validated_data):
        validated_data['tutor'] = self.context['request'].user
        return super().create(validated_data)


class TutoringRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()
    tutor_name     = serializers.SerializerMethodField()
    listing_id     = serializers.IntegerField(source='listing.id', read_only=True)

    class Meta:
        model = TutoringRequest
        fields = ['id', 'listing_id', 'requester_name', 'tutor_name', 'message', 'status', 'created_at', 'updated_at']
        read_only_fields = ['status', 'created_at', 'updated_at']

    def get_requester_name(self, obj):
        return f'{obj.requester.first_name} {obj.requester.last_name}'.strip() or obj.requester.username

    def get_tutor_name(self, obj):
        tutor = obj.listing.tutor
        return f'{tutor.first_name} {tutor.last_name}'.strip() or tutor.username
