from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        exclude = ['user']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'is_onboarded', 'created_at', 'profile']
        read_only_fields = ['id', 'created_at']


class UserMiniSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'avatar']

    def get_avatar(self, obj):
        try:
            if obj.profile.avatar:
                return obj.profile.avatar.url
        except UserProfile.DoesNotExist:
            pass
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user)
        return user


class OnboardingSerializer(serializers.Serializer):
    university = serializers.CharField(max_length=200, required=False, allow_blank=True)
    program = serializers.CharField(max_length=200, required=False, allow_blank=True)
    year_of_study = serializers.IntegerField(required=False, allow_null=True)
    courses = serializers.ListField(child=serializers.CharField(), required=False)
    study_style_tags = serializers.ListField(child=serializers.CharField(), required=False)
    availability = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
