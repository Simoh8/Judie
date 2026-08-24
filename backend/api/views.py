from django.shortcuts import render, redirect
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import transaction
from django.conf import settings
from django.core.mail import send_mail
import os
import re
import jwt
import requests as http_requests
from .models import User, Session, Booking, Review, LeadRequest
from .serializers import UserSerializer, SessionSerializer, BookingSerializer, BookingCreateSerializer, ReviewSerializer, ReviewCreateSerializer, LeadRequestSerializer, LeadRequestCreateSerializer
from .zoom_service import ZoomService
from .email_service import EmailService


GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"


def generate_auth_token(user: "User") -> str:
    """Generate a signed JWT token for the given user."""
    payload = {
        "user_id": user.id,
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def verify_google_id_token(id_token: str) -> dict | None:
    """
    Verify a Google ID token by calling Google's tokeninfo endpoint.
    Returns the token payload dict on success, or None on failure.
    """
    try:
        resp = http_requests.get(
            GOOGLE_TOKEN_INFO_URL,
            params={"id_token": id_token},
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        token_data = resp.json()

        # Verify the audience matches our configured client ID
        client_id = os.getenv("GOOGLE_OAUTH_CLIENT_ID", "")
        if client_id and token_data.get("aud") != client_id:
            return None

        return token_data
    except Exception:
        return None


class SignupView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name', '')

        if not email or not password:
            return Response(
                {'success': False, 'error': 'Email and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return Response(
                {'success': False, 'error': 'Invalid email format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate password strength (minimum 8 characters)
        if len(password) < 8:
            return Response(
                {'success': False, 'error': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'success': False, 'error': 'User already exists'},
                status=status.HTTP_409_CONFLICT
            )

        user = User.objects.create_user(
            email=email,
            username=email,
            password=password,
            first_name=name
        )

        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data,
            'token': f'simple_token_{user.id}'  # Simple token for demo
        })


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'success': False, 'error': 'Email and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return Response(
                {'success': False, 'error': 'Invalid email format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=email, password=password)
        
        if not user:
            return Response(
                {'success': False, 'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data,
            'token': f'simple_token_{user.id}'  # Simple token for demo
        })


class GoogleLoginView(APIView):
    def post(self, request):
        """
        Handle Google Sign-In ID token verification and login.
        The frontend sends the raw Google ID token credential; we verify it
        with Google's tokeninfo endpoint, then create/retrieve the user.
        """
        google_token = request.data.get('token')
        # Accept explicit email/name overrides only as fallbacks
        provided_email = request.data.get('email', '')
        provided_name = request.data.get('name', '')

        if not google_token:
            return Response(
                {'success': False, 'error': 'Google ID token required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify the token with Google
        token_data = verify_google_id_token(google_token)
        if not token_data:
            return Response(
                {'success': False, 'error': 'Invalid or expired Google token'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Extract verified identity from Google's response
        email = token_data.get('email') or provided_email
        name = token_data.get('name') or provided_name
        first_name = token_data.get('given_name', '')
        last_name = token_data.get('family_name', '')

        if not email:
            return Response(
                {'success': False, 'error': 'Could not retrieve email from Google token'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only accept verified email addresses from Google
        if not token_data.get('email_verified', False):
            return Response(
                {'success': False, 'error': 'Google email address is not verified'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Create or retrieve the user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': first_name or name.split(' ')[0] if name else '',
                'last_name': last_name,
            }
        )

        # Issue a signed JWT
        token = generate_auth_token(user)
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data,
            'token': token,
            'is_new_user': created
        })


class GoogleOAuthCallbackView(APIView):
    def get(self, request):
        """
        Handle OAuth callback from Google after successful authentication via django-allauth.
        Generates a signed JWT and redirects to the frontend callback page.
        """
        # Get the authenticated user from the session (set by allauth)
        if not request.user.is_authenticated:
            frontend_url = settings.FRONTEND_URL
            return redirect(f"{frontend_url}/?error=oauth_failed")

        user = request.user

        # Issue a signed JWT so the frontend doesn't need to trust plain IDs
        token = generate_auth_token(user)
        serializer = UserSerializer(user)

        frontend_url = settings.FRONTEND_URL
        redirect_url = (
            f"{frontend_url}/auth/callback"
            f"?token={token}"
            f"&user_id={user.id}"
            f"&email={user.email}"
            f"&name={user.get_full_name()}"
        )
        return redirect(redirect_url)


class ForgotPasswordView(APIView):
    def post(self, request):
        """Initiate password reset by sending email with reset link"""
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'success': False, 'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return Response(
                {'success': False, 'error': 'Invalid email format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists for security
            return Response({
                'success': True,
                'message': 'If an account with this email exists, a password reset link has been sent.'
            })
        
        # Generate reset token
        import secrets
        reset_token = secrets.token_urlsafe(32)
        reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        
        # Save token to user
        user.password_reset_token = reset_token
        user.password_reset_token_expires = reset_token_expires
        user.save()
        
        # Generate reset link
        frontend_url = settings.FRONTEND_URL
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Send email
        user_name = user.first_name or user.email.split('@')[0]
        email_sent = EmailService.send_password_reset_email(
            to_email=user.email,
            user_name=user_name,
            reset_link=reset_link
        )
        
        if not email_sent:
            return Response(
                {'success': False, 'error': 'Failed to send reset email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'success': True,
            'message': 'If an account with this email exists, a password reset link has been sent.'
        })


class ResetPasswordView(APIView):
    def post(self, request):
        """Reset password using valid token"""
        token = request.data.get('token')
        new_password = request.data.get('password')
        
        if not token or not new_password:
            return Response(
                {'success': False, 'error': 'Token and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password strength
        if len(new_password) < 8:
            return Response(
                {'success': False, 'error': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user with valid token
        try:
            user = User.objects.get(
                password_reset_token=token,
                password_reset_token_expires__gt=timezone.now()
            )
        except User.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Invalid or expired reset token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reset password
        user.set_password(new_password)
        user.password_reset_token = None
        user.password_reset_token_expires = None
        user.save()
        
        # Send confirmation email
        user_name = user.first_name or user.email.split('@')[0]
        EmailService.send_password_reset_confirmation_email(
            to_email=user.email,
            user_name=user_name
        )
        
        return Response({
            'success': True,
            'message': 'Password has been reset successfully'
        })


class VerifyResetTokenView(APIView):
    def get(self, request):
        """Verify if a reset token is valid"""
        token = request.query_params.get('token')
        
        if not token:
            return Response(
                {'success': False, 'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(
                password_reset_token=token,
                password_reset_token_expires__gt=timezone.now()
            )
            return Response({
                'success': True,
                'valid': True,
                'email': user.email
            })
        except User.DoesNotExist:
            return Response({
                'success': True,
                'valid': False
            })


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def get_queryset(self):
        queryset = Session.objects.all()
        session_type = self.request.query_params.get('type')
        upcoming = self.request.query_params.get('upcoming')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if session_type:
            queryset = queryset.filter(type=session_type)

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if upcoming == 'true':
            queryset = queryset.filter(
                scheduled_for__gt=timezone.now(),
                status='scheduled'
            ).order_by('scheduled_for')

        if search:
            queryset = queryset.filter(
                title__icontains=search
            ) | queryset.filter(
                description__icontains=search
            ) | queryset.filter(
                facilitator__icontains=search
            )

        return queryset.order_by('-scheduled_for')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the session first
        session = serializer.save()
        
        # Generate Zoom meeting
        zoom_meeting = ZoomService.create_meeting(
            topic=session.title,
            start_time=session.scheduled_for,
            duration_minutes=session.duration
        )
        
        if zoom_meeting:
            session.zoom_meeting_id = zoom_meeting['meeting_id']
            session.zoom_join_url = zoom_meeting['join_url']
            session.zoom_start_url = zoom_meeting['start_url']
            session.zoom_password = zoom_meeting['password']
            session.save()
        
        return Response({'success': True, 'session': SessionSerializer(session).data}, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        # Clean up associated Zoom meeting if present
        if instance.zoom_meeting_id:
            ZoomService.delete_meeting(instance.zoom_meeting_id)
        instance.delete()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'sessions': serializer.data})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def book(self, request, pk=None):
        session = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'success': False, 'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Lock the session row to prevent race conditions
        session = Session.objects.select_for_update().get(pk=session.pk)

        if session.current_participants >= session.max_participants:
            return Response(
                {'success': False, 'error': 'Session is full'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for existing confirmed booking
        if Booking.objects.filter(session=session, user=user, status='confirmed').exists():
            return Response(
                {'success': False, 'error': 'Already booked'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Reuse cancelled booking if exists, otherwise create new
        booking = Booking.objects.filter(session=session, user=user).first()
        if booking:
            # Only increment sessions_joined if reactivating a cancelled booking
            if booking.status != 'confirmed':
                user.sessions_joined += 1
                user.save()
            booking.status = 'confirmed'
            booking.save()
        else:
            booking = Booking.objects.create(session=session, user=user)
            user.sessions_joined += 1
            user.save()
        session.current_participants += 1
        session.save()

        # Send email with Zoom details
        if session.zoom_join_url:
            try:
                subject = f"Booking Confirmed: {session.title}"
                first_name = user.first_name or user.email.split('@')[0]
                scheduled_str = session.scheduled_for.strftime('%Y-%m-%d %H:%M')
                
                # Plain text fallback
                message = f'''Hi {first_name},

You have successfully booked the session "{session.title}".

Session Details:
- Title: {session.title}
- Type: {session.get_type_display()}
- Scheduled: {scheduled_str}
- Duration: {session.duration} minutes
- Facilitator: {session.facilitator}

Zoom Meeting Details:
- Join URL: {session.zoom_join_url}
- Meeting ID: {session.zoom_meeting_id}
- Password: {session.zoom_password}

Please join the meeting a few minutes before the scheduled start time.

See you there!
'''
                # Premium HTML email design
                html_message = f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Session Booking is Confirmed</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f5f6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      width: 100%;
      background-color: #f4f5f6;
      padding: 20px 0;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }}
    .header {{
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px 24px;
      text-align: center;
    }}
    .header h1 {{
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }}
    .content {{
      padding: 32px 24px;
    }}
    .greeting {{
      font-size: 18px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
      color: #0f172a;
    }}
    .intro {{
      font-size: 16px;
      line-height: 24px;
      color: #475569;
      margin-bottom: 24px;
    }}
    .card {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }}
    .card-title {{
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }}
    .detail-row {{
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 20px;
    }}
    .detail-label {{
      color: #64748b;
      font-weight: 500;
      display: inline-block;
      width: 120px;
    }}
    .detail-value {{
      color: #0f172a;
      font-weight: 600;
    }}
    .zoom-box {{
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 28px;
    }}
    .zoom-title {{
      font-size: 16px;
      font-weight: 600;
      color: #1e40af;
      margin-top: 0;
      margin-bottom: 12px;
    }}
    .zoom-credentials {{
      font-size: 14px;
      color: #1e3a8a;
      margin-bottom: 16px;
      line-height: 1.5;
    }}
    .zoom-btn-container {{
      text-align: center;
      margin-top: 16px;
    }}
    .zoom-btn {{
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 6px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }}
    .footer {{
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      background-color: #f8fafc;
      border-top: 1px solid #f1f5f9;
    }}
    .footer p {{
      margin: 4px 0;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Booking Confirmed</h1>
      </div>
      <div class="content">
        <p class="greeting">Hi {first_name},</p>
        <p class="intro">You have successfully booked the session <strong>"{session.title}"</strong>. Here are your details and Zoom join link:</p>
        
        <div class="card">
          <div class="card-title">Session Information</div>
          <div class="detail-row">
            <span class="detail-label">Title</span>
            <span class="detail-value">{session.title}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Type</span>
            <span class="detail-value">{session.get_type_display()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">{scheduled_str}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration</span>
            <span class="detail-value">{session.duration} minutes</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Facilitator</span>
            <span class="detail-value">{session.facilitator}</span>
          </div>
        </div>
        
        <div class="zoom-box">
          <div class="zoom-title">🎥 Zoom Meeting Details</div>
          <div class="zoom-credentials">
            <div style="margin-bottom: 6px;"><strong>Meeting ID:</strong> {session.zoom_meeting_id}</div>
            <div><strong>Password:</strong> {session.zoom_password}</div>
          </div>
          <div class="zoom-btn-container">
            <a href="{session.zoom_join_url}" target="_blank" class="zoom-btn">Join Zoom Call</a>
          </div>
        </div>
        
        <p class="intro" style="margin-bottom: 0; font-size: 14px; color: #64748b;">Please join the meeting a few minutes before the scheduled start time. See you there!</p>
      </div>
      <div class="footer">
        <p>&copy; 2026 Flown. All rights reserved.</p>
        <p>This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
'''
                send_mail(
                    subject,
                    message,
                    getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@flown.com'),
                    [user.email],
                    html_message=html_message,
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send Zoom details email: {e}")

        # Return the updated session data instead of booking data
        session_serializer = SessionSerializer(session)
        return Response({'success': True, 'session': session_serializer.data})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def cancel_booking(self, request, pk=None):
        session = self.get_object()
        user_id = request.data.get('user_id')

        try:
            user = User.objects.get(id=user_id)
            booking = Booking.objects.get(session=session, user=user, status='confirmed')
        except (User.DoesNotExist, Booking.DoesNotExist):
            return Response(
                {'success': False, 'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        booking.status = 'cancelled'
        booking.save()

        session.current_participants = max(0, session.current_participants - 1)
        session.save()

        user.sessions_joined = max(0, user.sessions_joined - 1)
        user.save()

        # Return the updated session data
        session_serializer = SessionSerializer(session)
        return Response({'success': True, 'session': session_serializer.data})

    @action(detail=True, methods=['post'])
    def start_session(self, request, pk=None):
        """Admin action to start a session"""
        session = self.get_object()
        session.status = 'live'
        session.save()
        serializer = self.get_serializer(session)
        return Response({'success': True, 'session': serializer.data})

    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """Admin action to end a session"""
        session = self.get_object()
        session.status = 'completed'
        session.save()

        # Update focus hours for all participants
        bookings = Booking.objects.filter(session=session, status='confirmed')
        focus_hours = session.duration / 60
        for booking in bookings:
            booking.status = 'completed'
            booking.user.focus_hours += focus_hours
            booking.user.save()
            booking.save()

        serializer = self.get_serializer(session)
        return Response({'success': True, 'session': serializer.data})

    @action(detail=True, methods=['get'])
    @permission_classes([permissions.IsAdminUser])
    def participants(self, request, pk=None):
        """Get all participants for a session (admin only)"""
        session = self.get_object()
        bookings = Booking.objects.filter(session=session, status='confirmed')
        participants = []
        for booking in bookings:
            participants.append({
                'id': booking.user.id,
                'email': booking.user.email,
                'firstName': booking.user.first_name,
                'lastName': booking.user.last_name,
                'bookedAt': booking.booked_at.isoformat()
            })

        return Response({
            'success': True,
            'participants': participants,
            'count': len(participants)
        })

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get all reviews for a session"""
        session = self.get_object()
        reviews = session.reviews.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response({'success': True, 'reviews': serializer.data})

    @action(detail=False, methods=['get'])
    @permission_classes([permissions.IsAdminUser])
    def stats(self, request):
        """Get session statistics (admin only)"""
        total_sessions = Session.objects.count()
        scheduled_sessions = Session.objects.filter(status='scheduled').count()
        live_sessions = Session.objects.filter(status='live').count()
        completed_sessions = Session.objects.filter(status='completed').count()
        total_bookings = Booking.objects.filter(status='confirmed').count()

        return Response({
            'success': True,
            'stats': {
                'totalSessions': total_sessions,
                'scheduledSessions': scheduled_sessions,
                'liveSessions': live_sessions,
                'completedSessions': completed_sessions,
                'totalBookings': total_bookings
            }
        })


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'users': serializer.data})

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response({'success': True, 'user': serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({'success': True, 'user': serializer.data})

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        user = self.get_object()
        bookings = Booking.objects.filter(user=user, status='confirmed')
        sessions = [booking.session for booking in bookings]
        serializer = SessionSerializer(sessions, many=True)
        return Response({'success': True, 'sessions': serializer.data})


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_queryset(self):
        queryset = Review.objects.all()
        session_id = self.request.query_params.get('session')
        user_id = self.request.query_params.get('user')

        if session_id:
            queryset = queryset.filter(session_id=session_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Verify user participated in the session
        session = serializer.validated_data['session']
        user = serializer.validated_data['user']
        
        if not Booking.objects.filter(session=session, user=user, status='completed').exists():
            return Response(
                {'success': False, 'error': 'User must have completed the session to review it'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_create(serializer)
        return Response({'success': True, 'review': ReviewSerializer(serializer.instance).data}, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'reviews': serializer.data})


class LeadRequestViewSet(viewsets.ModelViewSet):
    queryset = LeadRequest.objects.all()
    serializer_class = LeadRequestSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return LeadRequestCreateSerializer
        return LeadRequestSerializer

    def get_queryset(self):
        queryset = LeadRequest.objects.all()
        session_id = self.request.query_params.get('session')
        user_id = self.request.query_params.get('user')
        status_filter = self.request.query_params.get('status')

        if session_id:
            queryset = queryset.filter(session_id=session_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'leadRequests': serializer.data})

    def create(self, request, *args, **kwargs):
        # Extract session and user from request data before validation
        session_id = request.data.get('session')
        user_id = request.data.get('user')
        
        # Check for existing request and delete if not pending
        existing_request = LeadRequest.objects.filter(session_id=session_id, user_id=user_id).first()
        if existing_request:
            if existing_request.status == 'pending':
                return Response(
                    {'success': False, 'error': 'You already have a pending request for this session'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Delete rejected/approved requests to allow resubmission
            existing_request.delete()
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Verify user has booked the session
        session = serializer.validated_data['session']
        user = serializer.validated_data['user']

        if not Booking.objects.filter(session=session, user=user, status='confirmed').exists():
            return Response(
                {'success': False, 'error': 'User must have booked the session to request to lead'},
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_create(serializer)
        
        # Send email notification to admin
        try:
            admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@flown.com')
            subject = f'New Lead Request: {user.email} wants to lead "{session.title}"'
            message = f'''
User {user.email} ({user.get_full_name() or user.email}) has requested to lead the session "{session.title}".

Session Details:
- Title: {session.title}
- Type: {session.get_type_display()}
- Scheduled: {session.scheduled_for.strftime('%Y-%m-%d %H:%M')}
- Duration: {session.duration} minutes

You can approve or reject this request in the admin dashboard.
'''
            send_mail(
                subject,
                message,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@flown.com'),
                [admin_email],
                fail_silently=True,
            )
        except Exception as e:
            # Log error but don't fail the request if email fails
            print(f"Failed to send email notification: {e}")
        
        return Response({'success': True, 'leadRequest': LeadRequestSerializer(serializer.instance).data}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    @permission_classes([permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Admin action to approve a lead request"""
        lead_request = self.get_object()
        
        if lead_request.status != 'pending':
            return Response(
                {'success': False, 'error': 'Request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Set the session leader
            lead_request.session.leader = lead_request.user
            lead_request.session.save()

            # Update lead request status
            lead_request.status = 'approved'
            lead_request.save()

            # Reject all other pending requests for this session
            LeadRequest.objects.filter(
                session=lead_request.session,
                status='pending'
            ).exclude(id=lead_request.id).update(status='rejected')

        serializer = self.get_serializer(lead_request)
        return Response({'success': True, 'leadRequest': serializer.data})

    @action(detail=True, methods=['post'])
    @permission_classes([permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Admin action to reject a lead request"""
        lead_request = self.get_object()
        
        if lead_request.status != 'pending':
            return Response(
                {'success': False, 'error': 'Request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )

        lead_request.status = 'rejected'
        lead_request.save()

        serializer = self.get_serializer(lead_request)
        return Response({'success': True, 'leadRequest': serializer.data})

