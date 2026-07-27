from rest_framework import serializers
from .models import User, Session, Booking


class UserSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', read_only=True)
    lastName = serializers.CharField(source='last_name', read_only=True)
    focusHours = serializers.DecimalField(source='focus_hours', read_only=True, max_digits=5, decimal_places=2)
    sessionsJoined = serializers.IntegerField(source='sessions_joined', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    isStaff = serializers.BooleanField(source='is_staff', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'firstName', 'lastName', 'focusHours', 'sessionsJoined', 'createdAt', 'isStaff']
        read_only_fields = ['id', 'focusHours', 'sessionsJoined', 'createdAt', 'isStaff']


class SessionSerializer(serializers.ModelSerializer):
    scheduledFor = serializers.DateTimeField(source='scheduled_for')
    maxParticipants = serializers.IntegerField(source='max_participants')
    currentParticipants = serializers.IntegerField(source='current_participants', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'title', 'type', 'duration', 'scheduledFor', 'facilitator',
                  'maxParticipants', 'currentParticipants', 'status', 'description', 'createdAt']
        read_only_fields = ['id', 'currentParticipants', 'createdAt']


class BookingSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    bookedAt = serializers.DateTimeField(source='booked_at', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'session', 'user', 'bookedAt', 'status']
        read_only_fields = ['id', 'bookedAt']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['session', 'user']
