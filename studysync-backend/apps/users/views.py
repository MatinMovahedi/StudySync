import base64
import io
import pyotp
import qrcode
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model, authenticate
from django.conf import settings
from .models import UserProfile
from .serializers import UserSerializer, RegisterSerializer, UserProfileSerializer, OnboardingSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class OnboardingView(APIView):
    def post(self, request):
        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        for field, value in data.items():
            setattr(profile, field, value)
        profile.save()
        request.user.is_onboarded = True
        request.user.save(update_fields=['is_onboarded'])
        return Response(UserSerializer(request.user).data)


class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.select_related('profile')
    lookup_field = 'pk'


class ChangePasswordView(APIView):
    def patch(self, request):
        current = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        if not current or not new_password:
            return Response({'error': 'Both fields are required'}, status=status.HTTP_400_BAD_REQUEST)
        if not request.user.check_password(current):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_password)
        request.user.save(update_fields=['password'])
        return Response({'message': 'Password updated'})


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        profile = getattr(user, 'profile', None)
        if profile and profile.two_fa_enabled:
            # Issue a short-lived temp token (5 min) carrying only user_id
            temp_token = AccessToken()
            temp_token.set_exp(lifetime=__import__('datetime').timedelta(minutes=5))
            temp_token['user_id'] = user.pk
            temp_token['is_2fa_temp'] = True
            return Response({'requires_2fa': True, 'temp_token': str(temp_token)})

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class TwoFASetupView(APIView):
    def get(self, request):
        secret = pyotp.random_base32()
        uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=request.user.email,
            issuer_name='StudySynch',
        )
        img = qrcode.make(uri)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_b64 = base64.b64encode(buffer.getvalue()).decode()
        return Response({'secret': secret, 'qr_code': f'data:image/png;base64,{qr_b64}'})


class TwoFAEnableView(APIView):
    def post(self, request):
        secret = request.data.get('secret', '')
        code = request.data.get('code', '')
        if not secret or not code:
            return Response({'error': 'secret and code are required'}, status=status.HTTP_400_BAD_REQUEST)
        totp = pyotp.TOTP(secret)
        if not totp.verify(code, valid_window=1):
            return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.totp_secret = secret
        profile.two_fa_enabled = True
        profile.save(update_fields=['totp_secret', 'two_fa_enabled'])
        return Response({'enabled': True})


class TwoFADisableView(APIView):
    def post(self, request):
        code = request.data.get('code', '')
        profile = getattr(request.user, 'profile', None)
        if not profile or not profile.two_fa_enabled:
            return Response({'error': '2FA is not enabled'}, status=status.HTTP_400_BAD_REQUEST)
        totp = pyotp.TOTP(profile.totp_secret)
        if not totp.verify(code, valid_window=1):
            return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
        profile.totp_secret = ''
        profile.two_fa_enabled = False
        profile.save(update_fields=['totp_secret', 'two_fa_enabled'])
        return Response({'enabled': False})


class TwoFAVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        temp_token_str = request.data.get('temp_token', '')
        code = request.data.get('code', '')
        try:
            token = AccessToken(temp_token_str)
            if not token.get('is_2fa_temp'):
                raise TokenError('Not a 2FA temp token')
            user_id = token['user_id']
        except TokenError:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)

        profile = getattr(user, 'profile', None)
        if not profile or not profile.two_fa_enabled:
            return Response({'error': '2FA not set up'}, status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(profile.totp_secret)
        if not totp.verify(code, valid_window=1):
            return Response({'error': 'Invalid code'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
