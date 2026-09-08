from rest_framework import serializers
from django.utils import timezone
from .models import User, Session, Booking, Review, LeadRequest, Package, Purchase, SystemSettings


class UserSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', required=False)
    lastName = serializers.CharField(source='last_name', required=False)
    focusHours = serializers.DecimalField(source='focus_hours', read_only=True, max_digits=5, decimal_places=2)
    sessionsJoined = serializers.IntegerField(source='sessions_joined', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    isStaff = serializers.BooleanField(source='is_staff', required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'firstName', 'lastName', 'focusHours', 'sessionsJoined', 'createdAt', 'isStaff']
        read_only_fields = ['id', 'email', 'username', 'focusHours', 'sessionsJoined', 'createdAt']


class SessionSerializer(serializers.ModelSerializer):
    scheduledFor = serializers.DateTimeField(source='scheduled_for', required=False)
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
    isOngoing = serializers.BooleanField(source='is_ongoing')
    regenerateIntervalHours = serializers.IntegerField(source='regenerate_interval_hours')
    lastRegeneratedAt = serializers.DateTimeField(source='last_regenerated_at', read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'title', 'type', 'duration', 'scheduledFor', 'facilitator',
                  'maxParticipants', 'currentParticipants', 'status', 'description', 'createdAt', 'averageRating', 'leader',
                  'zoomMeetingId', 'zoomJoinUrl', 'zoomStartUrl', 'zoomPassword', 'isBooked', 'isOngoing', 'regenerateIntervalHours', 'lastRegeneratedAt']
        read_only_fields = ['id', 'currentParticipants', 'createdAt', 'averageRating', 'leader',
                           'zoomMeetingId', 'zoomJoinUrl', 'zoomStartUrl', 'zoomPassword', 'isBooked', 'lastRegeneratedAt']

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

    def validate(self, attrs):
        # For ongoing sessions, set status to live automatically
        if 'is_ongoing' in attrs and attrs['is_ongoing']:
            attrs['status'] = 'live'
            # Set scheduled_for to now if not provided
            if not attrs.get('scheduled_for'):
                attrs['scheduled_for'] = timezone.now()
        return attrs




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


class PackageSerializer(serializers.ModelSerializer):
    duration = serializers.CharField(source='get_duration_display', read_only=True)
    rawDuration = serializers.CharField(source='duration', read_only=True)
    trialDays = serializers.IntegerField(source='trial_days')
    maxLeadRequests = serializers.IntegerField(source='max_lead_requests')
    maxSessions = serializers.IntegerField(source='max_sessions')
    allowedSessionTypes = serializers.JSONField(source='allowed_session_types')
    maxSessionDuration = serializers.IntegerField(source='max_session_duration')
    supportedRegions = serializers.JSONField(source='supported_regions')
    isFeatured = serializers.BooleanField(source='is_featured')
    sortOrder = serializers.IntegerField(source='sort_order')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Package
        fields = ['id', 'name', 'description', 'price', 'duration', 'rawDuration', 'trialDays',
                  'maxLeadRequests', 'maxSessions', 'allowedSessionTypes', 
                  'maxSessionDuration', 'supportedRegions', 'is_active', 
                  'isFeatured', 'sortOrder', 'createdAt', 'updatedAt']
        read_only_fields = ['id', 'createdAt', 'updatedAt']


class PackageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['name', 'description', 'price', 'duration', 'trial_days',
                  'max_lead_requests', 'max_sessions', 'allowed_session_types', 
                  'max_session_duration', 'supported_regions', 'is_active', 
                  'is_featured', 'sort_order']


class PurchaseSerializer(serializers.ModelSerializer):
    package = PackageSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    status = serializers.CharField(source='get_status_display', read_only=True)
    paymentMethod = serializers.CharField(source='get_payment_method_display', read_only=True)
    reconciliationStatus = serializers.CharField(source='get_reconciliation_status_display', read_only=True)
    paystackReference = serializers.CharField(source='paystack_reference', read_only=True)
    paystackTransactionId = serializers.CharField(source='paystack_transaction_id', read_only=True)
    sessionsUsed = serializers.IntegerField(source='sessions_used')
    leadRequestsUsed = serializers.IntegerField(source='lead_requests_used')
    validFrom = serializers.DateTimeField(source='valid_from')
    validUntil = serializers.DateTimeField(source='valid_until')
    paymentDate = serializers.DateTimeField(source='payment_date', read_only=True)
    invoiceNumber = serializers.CharField(source='invoice_number', read_only=True)
    receiptUrl = serializers.URLField(source='receipt_url', read_only=True)
    adminNotes = serializers.CharField(source='admin_notes', read_only=True)
    reconciledBy = UserSerializer(read_only=True)
    reconciledAt = serializers.DateTimeField(source='reconciled_at', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Purchase
        fields = ['id', 'package', 'user', 'status', 'amount', 'currency',
                  'paymentMethod', 'paymentDate', 'invoiceNumber', 'receiptUrl',
                  'reconciliationStatus', 'adminNotes', 'reconciledBy', 'reconciledAt',
                  'paystackReference', 'paystackTransactionId', 'sessionsUsed',
                  'leadRequestsUsed', 'validFrom', 'validUntil', 'createdAt', 'updatedAt']
        read_only_fields = ['id', 'createdAt', 'updatedAt', 'paymentDate', 'reconciledAt']


class PurchaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = ['user', 'package', 'amount', 'currency', 'payment_method', 'valid_from', 'valid_until']
        extra_kwargs = {
            'amount': {'required': False},
            'currency': {'required': False},
            'payment_method': {'required': False},
            'valid_from': {'required': False},
            'valid_until': {'required': False},
        }


class PurchaseReconciliationSerializer(serializers.ModelSerializer):
    """Serializer for admin payment reconciliation operations"""
    class Meta:
        model = Purchase
        fields = ['status', 'reconciliation_status', 'admin_notes', 'receipt_url', 'invoice_number']
        extra_kwargs = {
            'status': {'required': False},
            'reconciliation_status': {'required': True},
            'admin_notes': {'required': False},
            'receipt_url': {'required': False},
            'invoice_number': {'required': False},
        }


class SystemSettingsSerializer(serializers.ModelSerializer):
    decryptedValue = serializers.SerializerMethodField()
    categoryDisplay = serializers.CharField(source='get_category_display', read_only=True)
    typeDisplay = serializers.CharField(source='get_setting_type_display', read_only=True)
    
    class Meta:
        model = SystemSettings
        fields = ['id', 'key', 'value', 'decryptedValue', 'category', 'categoryDisplay', 
                  'setting_type', 'typeDisplay', 'description', 'is_encrypted', 'is_public', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_decryptedValue(self, obj):
        """Return decrypted value for encrypted settings"""
        if obj.is_encrypted:
            try:
                return obj.get_decrypted_value()
            except Exception as e:
                # Return the encrypted value if decryption fails
                return obj.value
        return obj.value


class SystemSettingsCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ['key', 'value', 'category', 'setting_type', 'description', 'is_encrypted', 'is_public']
    
    def validate(self, attrs):
        # Ensure encryption is only used with string type
        if attrs.get('is_encrypted') and attrs.get('setting_type') != 'string':
            raise serializers.ValidationError('Encryption can only be used with string type settings')
        return attrs


class SystemSettingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ['value', 'description', 'is_encrypted', 'is_public']
    
    def validate(self, attrs):
        # Ensure encryption is only used with string type
        if attrs.get('is_encrypted') and self.instance.setting_type != 'string':
            raise serializers.ValidationError('Encryption can only be used with string type settings')
        return attrs
