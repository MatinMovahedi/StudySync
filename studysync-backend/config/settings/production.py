from .base import *
import dj_database_url
import os

DEBUG = False

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

# Vercel Postgres uses POSTGRES_URL; Railway uses DATABASE_URL
_db_url = (
    os.environ.get('POSTGRES_URL') or
    os.environ.get('DATABASE_URL') or
    ''
)
if _db_url:
    # Vercel Postgres URLs use postgres:// — force postgresql:// for dj-database-url
    _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    DATABASES = {
        'default': dj_database_url.parse(_db_url, conn_max_age=600)
    }

# Whitenoise for static file serving
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Allow any *.vercel.app subdomain as a CORS fallback (covers preview deployments)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://[\w-]+\.vercel\.app$',
]

# Security
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
