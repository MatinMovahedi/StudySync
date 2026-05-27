from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from apps.users.views import LoginView, TwoFAVerifyView
from apps.search_api import GlobalSearchView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/auth/2fa/verify/', TwoFAVerifyView.as_view(), name='2fa-verify'),

    # App APIs
    path('api/users/', include('apps.users.urls')),
    path('api/groups/', include('apps.groups.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/sessions/', include('apps.sessions_app.urls')),
    path('api/ai/', include('apps.ai_assistant.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/campus/', include('apps.campus.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/gamification/', include('apps.gamification.urls')),
    path('api/communities/', include('apps.communities.urls')),
    path('api/posts/', include('apps.communities.post_urls')),
    path('api/comments/', include('apps.communities.comment_urls')),
    path('api/resources/', include('apps.resources.urls')),
    path('api/tutoring/', include('apps.tutoring.urls')),
    path('api/search/', GlobalSearchView.as_view(), name='global-search'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
