from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Session


class Command(BaseCommand):
    help = 'Create sample session data'

    def handle(self, *args, **options):
        # Clear existing sessions
        Session.objects.all().delete()

        now = timezone.now()
        
        sample_sessions = [
            {
                'title': 'Morning Focus Sprint',
                'type': 'sprint',
                'duration': 25,
                'scheduled_for': now + timedelta(hours=2),
                'facilitator': 'Sarah Chen',
                'max_participants': 10,
                'current_participants': 5,
                'status': 'scheduled',
                'description': 'Quick burst of productivity to start your day',
            },
            {
                'title': 'Deep Work Session',
                'type': 'deep-work',
                'duration': 50,
                'scheduled_for': now + timedelta(hours=4),
                'facilitator': 'Marcus Johnson',
                'max_participants': 8,
                'current_participants': 3,
                'status': 'scheduled',
                'description': 'Extended focus session for meaningful work',
            },
            {
                'title': 'Afternoon Marathon',
                'type': 'marathon',
                'duration': 90,
                'scheduled_for': now + timedelta(days=1),
                'facilitator': 'Emily Rodriguez',
                'max_participants': 12,
                'current_participants': 7,
                'status': 'scheduled',
                'description': 'Long session with built-in breaks for major milestones',
            },
        ]

        for session_data in sample_sessions:
            Session.objects.create(**session_data)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(sample_sessions)} sample sessions'))
