from rest_framework import serializers
from .models import User, Session, Booking, Review, LeadRequest


class UserSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', required=False)
    lastName = serializers.CharField(source='last_name', required=False)
    focusHours = serializers.DecimalField(source='focus_hours', read_only=True, max_digits=5, decimal_places=2)
    sessionsJoined = serializers.IntegerField(source='sessions_joined', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    isStaff = serializers.BooleanField(source='is_staff', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'firstName', 'lastName', 'focusHours', 'sessionsJoined', 'createdAt', 'isStaff']
        read_only_fields = ['id', 'email', 'username', 'focusHours', 'sessionsJoined', 'createdAt', 'isStaff']


class SessionSerializer(serializers.ModelSerializer):
    scheduledFor = serializers.DateTimeField(source='scheduled_for')
    maxParticipants = serializers.IntegerField(source='max_participants')
    currentParticipants = serializers.IntegerField(source='current_participants', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    averageRating = serializers.SerializerMethodField()
    leader = UserSerializer(read_only=True)
    zoomMeetingId = serializers.CharField(source='zoom_meeting_id', read_only=True)
    zoomJoinUrl = serializers.URLField(source='zoom_join_url', read_only=True)
    zoomStartUrl = serializers.URLField(source='zoom_start_url', read_only=True)
    zoomPassword = serializers.CharField(source='zoom_password', read_only=True)
    isBooked = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = ['id', 'title', 'type', 'duration', 'scheduledFor', 'facilitator',
                  'maxParticipants', 'currentParticipants', 'status', 'description', 'createdAt', 'averageRating', 'leader',
                  'zoomMeetingId', 'zoomJoinUrl', 'zoomStartUrl', 'zoomPassword', 'isBooked']
        read_only_fields = ['id', 'currentParticipants', 'createdAt', 'averageRating', 'leader',
                           'zoomMeetingId', 'zoomJoinUrl', 'zoomStartUrl', 'zoomPassword', 'isBooked']

    def get_averageRating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return sum(review.rating for review in reviews) / len(reviews)

    def get_isBooked(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.bookings.filter(user=request.user, status='confirmed').exists()
        return False


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


class ReviewSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'session', 'user', 'rating', 'comment', 'createdAt']
        read_only_fields = ['id', 'createdAt']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['session', 'user', 'rating', 'comment']


class LeadRequestSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = LeadRequest
        fields = ['id', 'session', 'user', 'status', 'createdAt', 'updatedAt']
        read_only_fields = ['id', 'createdAt', 'updatedAt']


class LeadRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadRequest
        fields = ['session', 'user']

    def validate(self, attrs):
        session = attrs['session']
        user = attrs['user']
        
        # Check for existing request
        existing = LeadRequest.objects.filter(session=session, user=user).first()
        if existing:
            if existing.status == 'pending':
                raise serializers.ValidationError('You already have a pending request for this session')
            # Allow resubmission by deleting old request
            existing.delete()
        
        return attrs
