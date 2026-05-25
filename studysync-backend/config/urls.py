from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # App APIs
    path('api/users/', include('apps.users.urls')),
    path('api/groups/', include('apps.groups.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/sessions/', include('apps.sessions_app.urls')),
    path('api/ai/', include('apps.ai_assistant.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/campus/', include('apps.campus.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
