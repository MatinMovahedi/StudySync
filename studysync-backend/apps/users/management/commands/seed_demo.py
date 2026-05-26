from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, datetime
import random

User = get_user_model()


DEMO_USERS = [
    {'email': 'alex@university.edu', 'username': 'alex_chen', 'first_name': 'Alex', 'last_name': 'Chen', 'program': 'Computer Science', 'year': 3, 'courses': ['CS301', 'CS401', 'MATH201'], 'style': ['pomodoro', 'night_owl'], 'bio': 'Passionate about ML and distributed systems. Always up for a late-night coding session!'},
    {'email': 'maya@university.edu', 'username': 'maya_patel', 'first_name': 'Maya', 'last_name': 'Patel', 'program': 'Data Science', 'year': 2, 'courses': ['DS201', 'STAT301', 'CS301'], 'style': ['visual', 'group_learner'], 'bio': 'Data nerd by day, amateur chef by night. Love turning complex datasets into beautiful stories.'},
    {'email': 'jordan@university.edu', 'username': 'jordan_kim', 'first_name': 'Jordan', 'last_name': 'Kim', 'program': 'Software Engineering', 'year': 4, 'courses': ['SE401', 'CS401', 'PROJ4XX'], 'style': ['early_bird', 'solo_studier'], 'bio': 'Final year SE student. Building my capstone project and preparing for the real world!'},
    {'email': 'priya@university.edu', 'username': 'priya_sharma', 'first_name': 'Priya', 'last_name': 'Sharma', 'program': 'Mathematics', 'year': 2, 'courses': ['MATH201', 'MATH301', 'STAT201'], 'style': ['early_bird', 'visual'], 'bio': 'Pure math enthusiast. If you need help with proofs, I am your person.'},
    {'email': 'luca@university.edu', 'username': 'luca_romano', 'first_name': 'Luca', 'last_name': 'Romano', 'program': 'Computer Science', 'year': 1, 'courses': ['CS101', 'MATH101', 'ENGL101'], 'style': ['group_learner', 'auditory'], 'bio': 'Freshman exploring everything CS has to offer. Always looking for study partners!'},
    {'email': 'sarah@university.edu', 'username': 'sarah_johnson', 'first_name': 'Sarah', 'last_name': 'Johnson', 'program': 'Cognitive Science', 'year': 3, 'courses': ['COGS301', 'PSYC201', 'CS201'], 'style': ['night_owl', 'solo_studier'], 'bio': 'Fascinated by the intersection of AI and human cognition. PhD track student.'},
    {'email': 'omar@university.edu', 'username': 'omar_hassan', 'first_name': 'Omar', 'last_name': 'Hassan', 'program': 'Electrical Engineering', 'year': 3, 'courses': ['EE301', 'EE401', 'MATH301'], 'style': ['pomodoro', 'visual'], 'bio': 'Circuit wizard and robotics enthusiast. Currently working on an autonomous drone project.'},
    {'email': 'emma@university.edu', 'username': 'emma_wilson', 'first_name': 'Emma', 'last_name': 'Wilson', 'program': 'Business Analytics', 'year': 2, 'courses': ['BUS201', 'STAT201', 'DS101'], 'style': ['group_learner', 'early_bird'], 'bio': 'Combining business acumen with data skills. Future consultant in the making!'},
]

DEMO_GROUPS = [
    {'name': 'CS401 Algorithm Masters', 'description': 'Weekly study sessions for Advanced Algorithms. We tackle problem sets together, do mock interviews, and prep for coding competitions.', 'course_code': 'CS401', 'category': 'exam_prep', 'color': '#6366f1'},
    {'name': 'ML Research Collective', 'description': 'For students passionate about machine learning research. We read papers, reproduce results, and work on Kaggle competitions together.', 'course_code': 'DS201', 'category': 'project_collab', 'color': '#8b5cf6'},
    {'name': 'Math Proof Squad', 'description': 'Struggling with real analysis or abstract algebra? Join us! We break down proofs step by step and help each other build mathematical intuition.', 'course_code': 'MATH301', 'category': 'assignment_help', 'color': '#06b6d4'},
    {'name': '24/7 Coding Session', 'description': 'Open coding session for CS students. Bring your projects, get unstuck, help others. All skill levels welcome. Virtual and in-person options.', 'course_code': 'CS301', 'category': 'coding_session', 'color': '#10b981'},
    {'name': 'Quiet Study Collective', 'description': 'Accountability-focused quiet study group. We use the Pomodoro technique: 25 min focus, 5 min break. No chatting, just deep work.', 'course_code': '', 'category': 'quiet_studying', 'color': '#f59e0b'},
    {'name': 'SE Capstone Crew', 'description': 'Final year SE students building capstone projects. Weekly standups, code reviews, and presentations. Agile methodology.', 'course_code': 'SE401', 'category': 'project_collab', 'color': '#ef4444'},
    {'name': 'Stats & Data Science Hub', 'description': 'For students in stats, data science, and analytics. R, Python, SPSS — all tools welcome. Weekly dataset challenges.', 'course_code': 'STAT301', 'category': 'general', 'color': '#3b82f6'},
    {'name': 'Freshman CS Survival Guide', 'description': 'A supportive space for first-year CS students. Upper years share their wisdom, and we tackle intro courses together. No judgment zone!', 'course_code': 'CS101', 'category': 'assignment_help', 'color': '#ec4899'},
]

DEMO_MESSAGES = [
    "Has anyone started on problem set 3 yet? The dynamic programming section is brutal",
    "I found a great YouTube explanation for the DP problems — want me to share the link in the resources channel?",
    "YES PLEASE. I have been staring at Q4 for two hours",
    "Okay sharing now. Also, anyone want to do a virtual session tomorrow at 7pm?",
    "I am down! My camera might be off though, connection issues",
    "Same time works for me. Should we use the usual Zoom link?",
    "Just pushed my solution to the shared repo. Please review if you get a chance!",
    "Your approach on Q2 is clever but I think there's an edge case for empty arrays",
    "Oh good catch! Fixing it now",
    "Midterm is in two weeks. Should we start a review doc?",
    "Already started one in the shared Drive. Check the pinned message",
    "This is why this group is the best. So organized",
    "Quick question — for the time complexity analysis, are we expected to derive it or just state it?",
    "The rubric says derive with justification. So show your work!",
    "Ugh okay. Thanks for checking",
    "Just finished the assignment. Took 6 hours but I am proud of it",
    "That is dedication! I need your energy",
    "Caffeine is a hell of a drug",
    "Anyone else going to the career fair tomorrow? We should meet up",
    "Yes! I will be there from 2-4pm. Look for the nervous person with a portfolio",
]

DEMO_SPOTS = [
    {'name': 'Main Library — Level 4 Quiet Zone', 'location': 'Main Library, 4th Floor', 'capacity': 80, 'amenities': ['WiFi', 'Power outlets', 'Natural light', 'Whiteboards'], 'rating': 4.8, 'noise_level': 'silent', 'hours': '7am - 11pm'},
    {'name': 'Engineering Building Collaboration Hub', 'location': 'Engineering Building, Room 101', 'capacity': 30, 'amenities': ['WiFi', 'Whiteboards', 'Monitors', 'Coffee machine'], 'rating': 4.6, 'noise_level': 'moderate', 'hours': '8am - 10pm'},
    {'name': 'Student Union Study Pods', 'location': 'Student Union, 2nd Floor', 'capacity': 24, 'amenities': ['WiFi', 'Sound dampening', 'Monitors', 'Privacy screens'], 'rating': 4.5, 'noise_level': 'quiet', 'hours': '24/7', 'is_open_24h': True},
    {'name': 'Coffee & Code Café', 'location': 'Science Building Annex', 'capacity': 40, 'amenities': ['WiFi', 'Coffee', 'Snacks', 'Casual seating'], 'rating': 4.3, 'noise_level': 'moderate', 'hours': '8am - 8pm'},
    {'name': 'Rooftop Garden Study Space', 'location': 'Arts Building Rooftop', 'capacity': 20, 'amenities': ['WiFi', 'Fresh air', 'Comfortable seating', 'Views'], 'rating': 4.7, 'noise_level': 'quiet', 'hours': '10am - 6pm'},
    {'name': 'Late Night Lounge', 'location': 'Residence Hall Common Room', 'capacity': 15, 'amenities': ['WiFi', 'Microwaves', 'Vending machines', 'TV'], 'rating': 4.0, 'noise_level': 'moderate', 'hours': '24/7', 'is_open_24h': True},
]


class Command(BaseCommand):
    help = 'Seed database with demo data for StudySynch'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding demo data...')
        from apps.users.models import UserProfile
        from apps.groups.models import StudyGroup, GroupMembership
        from apps.chat.models import Message
        from apps.sessions_app.models import StudySession
        from apps.campus.models import StudySpot
        from apps.analytics.models import StudyStreak, DailyStudyLog

        # Create users
        created_users = []
        for u in DEMO_USERS:
            user, created = User.objects.get_or_create(email=u['email'], defaults={
                'username': u['username'], 'first_name': u['first_name'], 'last_name': u['last_name'],
                'is_onboarded': True,
            })
            if created:
                user.set_password('StudySynch2024!')
                user.save()
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.program = u['program']
            profile.university = 'University of Toronto'
            profile.year_of_study = u['year']
            profile.courses = u['courses']
            profile.study_style_tags = u['style']
            profile.bio = u['bio']
            profile.availability = random.choice(['morning', 'afternoon', 'evening', 'night', 'flexible'])
            profile.total_study_hours = round(random.uniform(20, 200), 1)
            profile.total_sessions = random.randint(10, 100)
            profile.save()
            StudyStreak.objects.get_or_create(user=user, defaults={
                'current_streak': random.randint(1, 30),
                'longest_streak': random.randint(15, 60),
                'total_study_days': random.randint(20, 150),
                'last_study_date': timezone.now().date() - timedelta(days=random.randint(0, 2)),
            })
            for i in range(14):
                day = timezone.now().date() - timedelta(days=i)
                DailyStudyLog.objects.get_or_create(user=user, date=day, defaults={
                    'minutes_studied': random.randint(0, 180),
                    'sessions_completed': random.randint(0, 4),
                    'subjects': random.sample(u['courses'], k=min(2, len(u['courses']))),
                })
            created_users.append(user)
            self.stdout.write(f'  Created user: {user.email}')

        # Create groups
        created_groups = []
        for i, g in enumerate(DEMO_GROUPS):
            creator = created_users[i % len(created_users)]
            group, created = StudyGroup.objects.get_or_create(name=g['name'], defaults={
                'description': g['description'], 'course_code': g['course_code'],
                'category': g['category'], 'avatar_color': g['color'],
                'created_by': creator, 'max_members': 20,
            })
            if created:
                GroupMembership.objects.get_or_create(user=creator, group=group, defaults={'role': 'admin'})
                members_to_add = random.sample(created_users, k=random.randint(3, min(7, len(created_users))))
                for member in members_to_add:
                    if member != creator:
                        GroupMembership.objects.get_or_create(user=member, group=group, defaults={'role': 'member'})
                for j, msg_content in enumerate(random.sample(DEMO_MESSAGES, k=min(10, len(DEMO_MESSAGES)))):
                    sender = random.choice(list(group.members.all()))
                    Message.objects.create(
                        group=group, sender=sender, content=msg_content, message_type='text',
                        created_at=timezone.now() - timedelta(hours=random.randint(1, 72)),
                    )
                for k in range(2):
                    session_date = timezone.now() + timedelta(days=random.randint(1, 14))
                    StudySession.objects.create(
                        group=group, created_by=creator,
                        title=f"{g['name']} — Session {k+1}",
                        description='Join us for an intensive study session!',
                        scheduled_at=session_date,
                        duration_minutes=random.choice([60, 90, 120]),
                        is_online=True,
                        join_link='https://meet.google.com/abc-defg-hij',
                    )
            created_groups.append(group)
            self.stdout.write(f'  Created group: {group.name}')

        # Create study spots
        for s in DEMO_SPOTS:
            StudySpot.objects.get_or_create(name=s['name'], defaults={
                'location': s['location'], 'capacity': s['capacity'],
                'amenities': s['amenities'], 'rating': s['rating'],
                'noise_level': s['noise_level'], 'hours': s['hours'],
                'is_open_24h': s.get('is_open_24h', False),
            })

        self.stdout.write(self.style.SUCCESS(f'\nDemo data seeded successfully!'))
        self.stdout.write(f'Users: {len(created_users)} | Groups: {len(created_groups)} | Spots: {len(DEMO_SPOTS)}')
        self.stdout.write('Login with any user: password = StudySynch2024!')
