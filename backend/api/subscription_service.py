from django.utils import timezone
from django.db import transaction
from .models import User, Purchase, Session, Booking, LeadRequest, UserActivity


class SubscriptionService:
    """Service to handle subscription-related operations and usage tracking"""
    
    @staticmethod
    def get_active_purchase(user):
        """Get the user's active purchase (subscription)"""
        now = timezone.now()
        return Purchase.objects.filter(
            user=user,
            status='completed',
            valid_from__lte=now,
            valid_until__gte=now
        ).first()
    
    @staticmethod
    def check_session_availability(user):
        """Check if user has available session credits"""
        purchase = SubscriptionService.get_active_purchase(user)
        if not purchase:
            return False, "No active subscription"
        
        if purchase.package.max_sessions == 0:
            return True, "Unlimited sessions"
        
        remaining = purchase.package.max_sessions - purchase.sessions_used
        if remaining <= 0:
            return False, f"No session credits remaining ({purchase.sessions_used}/{purchase.package.max_sessions} used)"
        
        return True, f"{remaining} session credits remaining"
    
    @staticmethod
    def check_lead_request_availability(user):
        """Check if user has available lead request credits"""
        purchase = SubscriptionService.get_active_purchase(user)
        if not purchase:
            return False, "No active subscription"
        
        if purchase.package.max_lead_requests == 0:
            return True, "Unlimited lead requests"
        
        remaining = purchase.package.max_lead_requests - purchase.lead_requests_used
        if remaining <= 0:
            return False, f"No lead request credits remaining ({purchase.lead_requests_used}/{purchase.package.max_lead_requests} used)"
        
        return True, f"{remaining} lead request credits remaining"
    
    @staticmethod
    @transaction.atomic
    def record_session_booking(user, session, purchase=None):
        """Record a session booking and update usage tracking"""
        if purchase is None:
            purchase = SubscriptionService.get_active_purchase(user)
        
        # Create activity record
        activity = UserActivity.objects.create(
            user=user,
            activity_type='session_booking',
            session=session,
            purchase=purchase,
            description=f"Booked session: {session.title}",
            metadata={
                'session_id': session.id,
                'session_title': session.title,
                'session_type': session.type,
                'scheduled_for': session.scheduled_for.isoformat() if session.scheduled_for else None,
                'duration': session.duration,
            },
            sessions_consumed=1
        )
        
        # Update purchase usage if applicable
        if purchase and purchase.package.max_sessions > 0:
            purchase.sessions_used += 1
            purchase.save(update_fields=['sessions_used', 'updated_at'])
            activity.metadata['sessions_used'] = purchase.sessions_used
            activity.metadata['max_sessions'] = purchase.package.max_sessions
            activity.save()
        
        return activity
    
    @staticmethod
    @transaction.atomic
    def record_session_cancellation(user, session, purchase=None):
        """Record a session cancellation and revert usage tracking"""
        if purchase is None:
            purchase = SubscriptionService.get_active_purchase(user)
        
        # Create activity record
        activity = UserActivity.objects.create(
            user=user,
            activity_type='session_cancellation',
            session=session,
            purchase=purchase,
            description=f"Cancelled session: {session.title}",
            metadata={
                'session_id': session.id,
                'session_title': session.title,
                'session_type': session.type,
                'scheduled_for': session.scheduled_for.isoformat() if session.scheduled_for else None,
            },
            sessions_consumed=-1  # Negative to indicate credit refund
        )
        
        # Revert purchase usage if applicable
        if purchase and purchase.package.max_sessions > 0:
            purchase.sessions_used = max(0, purchase.sessions_used - 1)
            purchase.save(update_fields=['sessions_used', 'updated_at'])
            activity.metadata['sessions_used'] = purchase.sessions_used
            activity.metadata['max_sessions'] = purchase.package.max_sessions
            activity.save()
        
        return activity
    
    @staticmethod
    @transaction.atomic
    def record_session_completion(user, session, purchase=None):
        """Record a session completion"""
        if purchase is None:
            purchase = SubscriptionService.get_active_purchase(user)
        
        activity = UserActivity.objects.create(
            user=user,
            activity_type='session_completion',
            session=session,
            purchase=purchase,
            description=f"Completed session: {session.title}",
            metadata={
                'session_id': session.id,
                'session_title': session.title,
                'session_type': session.type,
                'duration': session.duration,
            }
        )
        
        return activity
    
    @staticmethod
    @transaction.atomic
    def record_lead_request(user, session, lead_request, purchase=None):
        """Record a lead request and update usage tracking"""
        if purchase is None:
            purchase = SubscriptionService.get_active_purchase(user)
        
        # Create activity record
        activity = UserActivity.objects.create(
            user=user,
            activity_type='lead_request',
            session=session,
            lead_request=lead_request,
            purchase=purchase,
            description=f"Requested to lead session: {session.title}",
            metadata={
                'session_id': session.id,
                'session_title': session.title,
                'lead_request_id': lead_request.id,
                'status': lead_request.status,
            },
            lead_requests_consumed=1
        )
        
        # Update purchase usage if applicable
        if purchase and purchase.package.max_lead_requests > 0:
            purchase.lead_requests_used += 1
            purchase.save(update_fields=['lead_requests_used', 'updated_at'])
            activity.metadata['lead_requests_used'] = purchase.lead_requests_used
            activity.metadata['max_lead_requests'] = purchase.package.max_lead_requests
            activity.save()
        
        return activity
    
    @staticmethod
    @transaction.atomic
    def record_lead_request_status(user, lead_request, status, purchase=None):
        """Record lead request approval/rejection"""
        if purchase is None:
            purchase = SubscriptionService.get_active_purchase(user)
        
        activity_type = 'lead_request_approved' if status == 'approved' else 'lead_request_rejected'
        
        activity = UserActivity.objects.create(
            user=user,
            activity_type=activity_type,
            session=lead_request.session,
            lead_request=lead_request,
            purchase=purchase,
            description=f"Lead request {status}: {lead_request.session.title}",
            metadata={
                'session_id': lead_request.session.id,
                'session_title': lead_request.session.title,
                'lead_request_id': lead_request.id,
                'previous_status': lead_request.status,
            }
        )
        
        return activity
    
    @staticmethod
    def get_user_usage_summary(user):
        """Get comprehensive usage summary for a user"""
        purchase = SubscriptionService.get_active_purchase(user)
        
        if not purchase:
            return {
                'has_active_subscription': False,
                'sessions_used': 0,
                'sessions_remaining': 0,
                'lead_requests_used': 0,
                'lead_requests_remaining': 0,
                'valid_until': None,
                'package_name': None
            }
        
        sessions_remaining = (
            float('inf') if purchase.package.max_sessions == 0 
            else max(0, purchase.package.max_sessions - purchase.sessions_used)
        )
        
        lead_requests_remaining = (
            float('inf') if purchase.package.max_lead_requests == 0 
            else max(0, purchase.package.max_lead_requests - purchase.lead_requests_used)
        )
        
        return {
            'has_active_subscription': True,
            'sessions_used': purchase.sessions_used,
            'sessions_remaining': sessions_remaining,
            'lead_requests_used': purchase.lead_requests_used,
            'lead_requests_remaining': lead_requests_remaining,
            'valid_until': purchase.valid_until,
            'package_name': purchase.package.name,
            'max_sessions': purchase.package.max_sessions,
            'max_lead_requests': purchase.package.max_lead_requests,
        }
    
    @staticmethod
    def get_user_activity_log(user, limit=50):
        """Get recent activity log for a user"""
        return UserActivity.objects.filter(
            user=user
        ).select_related(
            'session', 'purchase', 'lead_request'
        ).order_by('-created_at')[:limit]