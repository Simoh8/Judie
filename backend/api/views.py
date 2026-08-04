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
import os
import re
import jwt
import requests as http_requests
from .models import User, Session, Booking, Review
from .serializers import UserSerializer, SessionSerializer, BookingSerializer, BookingCreateSerializer, ReviewSerializer, ReviewCreateSerializer


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
        self.perform_create(serializer)
        return Response({'success': True, 'session': serializer.data}, status=status.HTTP_201_CREATED)

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

        if Booking.objects.filter(session=session, user=user).exists():
            return Response(
                {'success': False, 'error': 'Already booked'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking = Booking.objects.create(session=session, user=user)
        session.current_participants += 1
        session.save()
        
        user.sessions_joined += 1
        user.save()

        serializer = BookingSerializer(booking)
        return Response({'success': True, 'booking': serializer.data})

    @action(detail=True, methods=['post'])
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

        return Response({'success': True, 'message': 'Booking cancelled'})

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

