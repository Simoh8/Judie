from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Session
from api.zoom_service import ZoomService


class Command(BaseCommand):
    help = 'Regenerate ongoing sessions by creating new Zoom meetings when interval expires'

    def handle(self, *args, **options):
        now = timezone.now()
        ongoing_sessions = Session.objects.filter(is_ongoing=True)
        
        regenerated_count = 0
        for session in ongoing_sessions:
            # Check if session needs regeneration
            if session.last_regenerated_at:
                time_since_regeneration = now - session.last_regenerated_at
                hours_since = time_since_regeneration.total_seconds() / 3600
                
                if hours_since >= session.regenerate_interval_hours:
                    self.regenerate_session(session)
                    regenerated_count += 1
            else:
                # First time regeneration - regenerate immediately
                self.regenerate_session(session)
                regenerated_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully regenerated {regenerated_count} ongoing sessions')
        )

    def regenerate_session(self, session):
        """Regenerate Zoom meeting for an ongoing session"""
        try:
            # Delete old Zoom meeting if exists
            if session.zoom_meeting_id:
                ZoomService.delete_meeting(session.zoom_meeting_id)
            
            # Create new Zoom meeting
            new_meeting = ZoomService.create_meeting(
                topic=session.title,
                start_time=timezone.now() + timedelta(minutes=5),  # Start in 5 minutes
                duration_minutes=session.duration
            )
            
            if new_meeting:
                session.zoom_meeting_id = new_meeting['meeting_id']
                session.zoom_join_url = new_meeting['join_url']
                session.zoom_start_url = new_meeting['start_url']
                session.zoom_password = new_meeting['password']
                session.last_regenerated_at = timezone.now()
                session.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'Regenerated Zoom meeting for session: {session.title}')
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f'Failed to create new Zoom meeting for session: {session.title}')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error regenerating session {session.title}: {str(e)}')
            )