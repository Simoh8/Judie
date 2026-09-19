from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from cryptography.fernet import Fernet
from django.conf import settings
import base64


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    focus_hours = models.DecimalField(default=0, max_digits=10, decimal_places=2)
    sessions_joined = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    password_reset_token = models.CharField(max_length=255, blank=True, null=True)
    password_reset_token_expires = models.DateTimeField(blank=True, null=True)
    preferred_currency = models.CharField(max_length=3, default='USD', help_text="User's preferred currency for payments")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Session(models.Model):
    SESSION_TYPES = [
        ('sprint', 'Focus Sprint'),
        ('deep-work', 'Deep Work'),
        ('marathon', 'Marathon'),
        ('ongoing', 'Ongoing Call'),
    ]

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('completed', 'Completed'),
    ]

    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=SESSION_TYPES)
    duration = models.IntegerField()  # in minutes
    scheduled_for = models.DateTimeField()
    facilitator = models.CharField(max_length=100)
    max_participants = models.IntegerField(default=10)
    current_participants = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='led_sessions')
    
    # Zoom integration fields
    zoom_meeting_id = models.CharField(max_length=50, blank=True, null=True)
    zoom_join_url = models.URLField(blank=True, max_length=500, null=True)
    zoom_start_url = models.URLField(blank=True, max_length=500, null=True)
    zoom_password = models.CharField(max_length=50, blank=True, null=True)
    
    # Ongoing session fields
    is_ongoing = models.BooleanField(default=False)
    regenerate_interval_hours = models.IntegerField(default=5)
    last_regenerated_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['scheduled_for']


class LeadRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='lead_requests')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lead_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.session.title} ({self.status})"

    class Meta:
        ordering = ['-created_at']


class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    booked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')

    def __str__(self):
        return f"{self.user.email} - {self.session.title}"

    class Meta:
        unique_together = ['session', 'user']


class Review(models.Model):
    RATING_CHOICES = [
        (1, '1 star'),
        (2, '2 stars'),
        (3, '3 stars'),
        (4, '4 stars'),
        (5, '5 stars'),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.session.title} ({self.rating} stars)"

    class Meta:
        unique_together = ['session', 'user']
        ordering = ['-created_at']


class Package(models.Model):
    DURATION_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
        ('lifetime', 'Lifetime'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price in USD
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES, default='monthly')
    trial_days = models.IntegerField(default=0, help_text="Number of trial days for this package")
    
    # Features
    max_lead_requests = models.IntegerField(default=0, help_text="Maximum lead requests per period")
    max_sessions = models.IntegerField(default=0, help_text="Maximum sessions to join per period")
    allowed_session_types = models.JSONField(default=list, help_text="List of allowed session types")
    max_session_duration = models.IntegerField(default=120, help_text="Maximum session duration in minutes")
    
    # Regional support
    supported_regions = models.JSONField(default=list, help_text="List of supported region codes (e.g., ['US', 'UK', 'NG'])")
    
    # Display settings
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - ${self.price}"

    class Meta:
        ordering = ['sort_order', 'price']


class Purchase(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('paystack', 'Paystack'),
        ('bank_transfer', 'Bank Transfer'),
        ('card', 'Card'),
        ('other', 'Other'),
    ]
    
    RECONCILIATION_STATUS_CHOICES = [
        ('pending', 'Pending Reconciliation'),
        ('matched', 'Matched'),
        ('disputed', 'Disputed'),
        ('resolved', 'Resolved'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name='purchases')
    
    # Payment details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Enhanced payment tracking
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='paystack')
    payment_date = models.DateTimeField(blank=True, null=True, help_text="Date when payment was actually completed")
    invoice_number = models.CharField(max_length=50, blank=True, null=True, unique=True, help_text="Unique invoice number for tracking")
    receipt_url = models.URLField(blank=True, null=True, help_text="URL to payment receipt")
    
    # Paystack integration
    paystack_reference = models.CharField(max_length=100, blank=True, null=True, unique=True)
    paystack_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Reconciliation tracking
    reconciliation_status = models.CharField(max_length=20, choices=RECONCILIATION_STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, help_text="Admin notes for reconciliation purposes")
    reconciled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reconciled_purchases', help_text="Admin who reconciled this payment")
    reconciled_at = models.DateTimeField(blank=True, null=True, help_text="Date when payment was reconciled")
    
    # Usage tracking
    sessions_used = models.IntegerField(default=0)
    lead_requests_used = models.IntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.package.name} ({self.status})"

    class Meta:
        ordering = ['-created_at']


class EncryptionManager:
    """Helper class for encryption/decryption operations"""
    
    @staticmethod
    def get_encryption_key():
        """Get or create encryption key from settings"""
        key = getattr(settings, 'SETTINGS_ENCRYPTION_KEY', None)
        if not key:
            # Generate a new key if none exists
            key = Fernet.generate_key()
            print(f"Generated new encryption key. Add this to your .env: SETTINGS_ENCRYPTION_KEY={key.decode()}")
        # Ensure key is bytes
        if isinstance(key, str):
            key = key.encode()
        return key
    
    @staticmethod
    def is_encryption_configured():
        """Check if encryption is properly configured"""
        key = getattr(settings, 'SETTINGS_ENCRYPTION_KEY', None)
        return bool(key)
    
    @staticmethod
    def encrypt(value):
        """Encrypt a value"""
        if not value:
            return value
        key = EncryptionManager.get_encryption_key()
        fernet = Fernet(key)
        encrypted = fernet.encrypt(value.encode())
        return base64.b64encode(encrypted).decode()
    
    @staticmethod
    def decrypt(encrypted_value):
        """Decrypt a value"""
        if not encrypted_value:
            return encrypted_value
        try:
            key = EncryptionManager.get_encryption_key()
            fernet = Fernet(key)
            decoded = base64.b64decode(encrypted_value.encode())
            decrypted = fernet.decrypt(decoded)
            return decrypted.decode()
        except Exception as e:
            print(f"Decryption error: {e}")
            return encrypted_value


class SystemSettings(models.Model):
    """Model for storing system-wide settings with encryption support"""
    
    CATEGORY_CHOICES = [
        ('frontend', 'Frontend Settings'),
        ('backend', 'Backend Settings'),
        ('general', 'General Settings'),
    ]
    
    SETTING_TYPE_CHOICES = [
        ('string', 'String'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
        ('encrypted', 'Encrypted String'),
    ]
    
    key = models.CharField(max_length=255, unique=True, help_text="Unique setting key")
    value = models.TextField(help_text="Setting value (encrypted if type is 'encrypted')")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPE_CHOICES, default='string')
    description = models.TextField(blank=True, help_text="Description of what this setting does")
    is_encrypted = models.BooleanField(default=False, help_text="Whether this value should be encrypted")
    is_public = models.BooleanField(default=False, help_text="Whether this setting can be accessed by non-admin users")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Encrypt value if needed before saving
        if self.is_encrypted and self.value:
            self.value = EncryptionManager.encrypt(self.value)
        super().save(*args, **kwargs)
    
    def get_decrypted_value(self):
        """Get the decrypted value if encrypted"""
        if self.is_encrypted and self.value:
            return EncryptionManager.decrypt(self.value)
        return self.value
    
    def set_value(self, value):
        """Set value with automatic encryption if needed"""
        if self.is_encrypted and value:
            self.value = EncryptionManager.encrypt(value)
        else:
            self.value = value
    
    def __str__(self):
        return f"{self.category}.{self.key}"
    
    class Meta:
        ordering = ['category', 'key']
        verbose_name_plural = "System Settings"


class PaymentMethod(models.Model):
    """Model for storing user payment methods"""
    
    PAYMENT_TYPE_CHOICES = [
        ('card', 'Credit/Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('paypal', 'PayPal'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='card')
    
    # Card details (encrypted or tokenized)
    card_last4 = models.CharField(max_length=4, blank=True, null=True, help_text="Last 4 digits of card")
    card_expiry_month = models.CharField(max_length=2, blank=True, null=True, help_text="Card expiry month (MM)")
    card_expiry_year = models.CharField(max_length=4, blank=True, null=True, help_text="Card expiry year (YYYY)")
    card_brand = models.CharField(max_length=20, blank=True, null=True, help_text="Card brand (visa, mastercard, etc.)")
    
    # Payment processor tokens
    paystack_auth_code = models.CharField(max_length=255, blank=True, null=True, help_text="Paystack authorization code")
    paystack_token = models.CharField(max_length=255, blank=True, null=True, help_text="Paystack payment token")
    
    # Metadata
    is_default = models.BooleanField(default=False, help_text="Whether this is the default payment method")
    is_active = models.BooleanField(default=True, help_text="Whether this payment method is active")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        if self.payment_type == 'card' and self.card_last4:
            return f"{self.user.email} - {self.card_brand or 'Card'} •••• {self.card_last4}"
        return f"{self.user.email} - {self.get_payment_type_display()}"
    
    class Meta:
        ordering = ['-is_default', '-created_at']
        verbose_name_plural = "Payment Methods"


class UserActivity(models.Model):
    """Model to track all user activities for subscription management and analytics"""
    
    ACTIVITY_TYPES = [
        ('session_booking', 'Session Booking'),
        ('session_cancellation', 'Session Cancellation'),
        ('session_completion', 'Session Completion'),
        ('lead_request', 'Lead Request'),
        ('lead_request_approved', 'Lead Request Approved'),
        ('lead_request_rejected', 'Lead Request Rejected'),
        ('purchase', 'Purchase'),
        ('subscription_renewal', 'Subscription Renewal'),
        ('subscription_expiry', 'Subscription Expiry'),
        ('login', 'User Login'),
        ('profile_update', 'Profile Update'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    
    # Related objects (optional)
    session = models.ForeignKey(Session, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')
    purchase = models.ForeignKey(Purchase, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')
    lead_request = models.ForeignKey(LeadRequest, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')
    
    # Activity details
    description = models.TextField(blank=True, help_text="Detailed description of the activity")
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional activity data as JSON")
    
    # Usage tracking
    sessions_consumed = models.IntegerField(default=0, help_text="Number of session credits consumed")
    lead_requests_consumed = models.IntegerField(default=0, help_text="Number of lead request credits consumed")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.get_activity_type_display()} - {self.created_at}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "User Activities"
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['activity_type', '-created_at']),
            models.Index(fields=['created_at']),
        ]

