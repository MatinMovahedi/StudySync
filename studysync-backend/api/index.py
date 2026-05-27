import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

import django
django.setup()

from django.core.management import call_command
try:
    call_command('migrate', '--no-input', verbosity=0)
except Exception as e:
    print(f"Migration error: {e}")

try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if not User.objects.filter(is_superuser=True).exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@studysynch.org',
            password='StudySynch@Admin2024!',
            first_name='Admin',
            last_name='StudySynch',
        )
except Exception as e:
    print(f"Superuser creation error: {e}")

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
