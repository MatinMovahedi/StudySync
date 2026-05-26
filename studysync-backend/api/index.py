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

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
