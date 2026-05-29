from django.db import migrations


SPOTS = [
    {
        'name': 'Main Library — Quiet Zone',
        'description': 'The fourth floor of the main library is reserved for silent study. Individual carrels, power outlets at every seat, and natural light throughout.',
        'location': 'Main Library, 4th Floor, 100 University Ave',
        'capacity': 80,
        'amenities': ['WiFi', 'Power outlets', 'Printing', 'Natural light', 'Lockers'],
        'rating': 4.8,
        'image_url': '',
        'is_open_24h': False,
        'hours': 'Mon–Thu 7am–12am · Fri 7am–10pm · Sat–Sun 9am–12am',
        'noise_level': 'silent',
        'latitude': 43.6629,
        'longitude': -79.3957,
    },
    {
        'name': 'The Grind Café',
        'description': 'A lively campus café with comfortable seating, great coffee, and a study-friendly atmosphere. Perfect for group work and casual study sessions.',
        'location': 'Student Union Building, Ground Floor',
        'capacity': 40,
        'amenities': ['WiFi', 'Coffee & food', 'Power outlets', 'Group tables'],
        'rating': 4.5,
        'image_url': '',
        'is_open_24h': False,
        'hours': 'Mon–Fri 7:30am–9pm · Sat–Sun 9am–6pm',
        'noise_level': 'moderate',
        'latitude': 43.6615,
        'longitude': -79.3950,
    },
    {
        'name': 'Engineering Learning Commons',
        'description': 'Open collaborative study space designed for STEM students. Features whiteboards, group pods, and high-speed internet for technical coursework.',
        'location': 'Engineering Building, Room 120',
        'capacity': 60,
        'amenities': ['WiFi', 'Whiteboards', 'Power outlets', 'Group pods', 'Standing desks'],
        'rating': 4.6,
        'image_url': '',
        'is_open_24h': False,
        'hours': 'Mon–Fri 8am–10pm · Sat 10am–6pm',
        'noise_level': 'quiet',
        'latitude': 43.6640,
        'longitude': -79.3970,
    },
    {
        'name': '24-Hour Computer Lab',
        'description': 'Open all day and night with 120 workstations, licensed software, and fast printing. ID required after 10pm.',
        'location': 'Science Complex, B100',
        'capacity': 120,
        'amenities': ['Computers', 'WiFi', 'Printing', 'Scanning', 'Power outlets'],
        'rating': 4.2,
        'image_url': '',
        'is_open_24h': True,
        'hours': 'Open 24/7',
        'noise_level': 'quiet',
        'latitude': 43.6650,
        'longitude': -79.3945,
    },
    {
        'name': 'Rooftop Study Terrace',
        'description': 'A hidden gem — the rooftop terrace above the arts building has outdoor seating, shade, and WiFi. One of the most peaceful spots on campus.',
        'location': 'Arts Building, Rooftop (7th Floor)',
        'capacity': 25,
        'amenities': ['WiFi', 'Outdoor seating', 'Natural light', 'Phone charging stations'],
        'rating': 4.9,
        'image_url': '',
        'is_open_24h': False,
        'hours': 'Daily 8am–8pm (weather permitting)',
        'noise_level': 'quiet',
        'latitude': 43.6608,
        'longitude': -79.3960,
    },
    {
        'name': 'Business School Pod Rooms',
        'description': 'Bookable glass-walled pod rooms for groups of 2–6. Each pod has a monitor, HDMI, and whiteboard. Reserve via the student portal.',
        'location': 'Rotman School of Management, 2nd Floor',
        'capacity': 30,
        'amenities': ['WiFi', 'Monitor', 'Whiteboard', 'Bookable rooms', 'Power outlets'],
        'rating': 4.7,
        'image_url': '',
        'is_open_24h': False,
        'hours': 'Mon–Fri 8am–9pm · Sat 9am–5pm',
        'noise_level': 'moderate',
        'latitude': 43.6620,
        'longitude': -79.3975,
    },
    {
        'name': 'Medical Sciences Atrium',
        'description': 'A large, naturally lit atrium with plenty of individual seating. Busy during exam periods but usually has open spots throughout the day.',
        'location': 'Medical Sciences Building, Main Atrium',
        'capacity': 100,
        'amenities': ['WiFi', 'Natural light', 'Vending machines', 'Power outlets'],
        'rating': 4.3,
        'image_url': '',
        'is_open_24h': False,
        'hours': 'Mon–Fri 7am–11pm · Sat–Sun 9am–10pm',
        'noise_level': 'moderate',
        'latitude': 43.6635,
        'longitude': -79.3930,
    },
    {
        'name': 'Graduate Lounge',
        'description': 'Exclusively for graduate and upper-year students. Quiet, well-stocked with reference books, and rarely overcrowded. Bring your student ID.',
        'location': 'Graduate House, Room 210',
        'capacity': 30,
        'amenities': ['WiFi', 'Power outlets', 'Reference library', 'Lockers', 'Kitchen access'],
        'rating': 4.8,
        'image_url': '',
        'is_open_24h': False,
        'hours': 'Mon–Fri 9am–10pm · Sat 10am–6pm',
        'noise_level': 'silent',
        'latitude': 43.6600,
        'longitude': -79.3940,
    },
]


def seed_spots(apps, schema_editor):
    StudySpot = apps.get_model('campus', 'StudySpot')
    for spot in SPOTS:
        StudySpot.objects.get_or_create(name=spot['name'], defaults=spot)


def unseed_spots(apps, schema_editor):
    StudySpot = apps.get_model('campus', 'StudySpot')
    StudySpot.objects.filter(name__in=[s['name'] for s in SPOTS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('campus', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_spots, unseed_spots),
    ]
