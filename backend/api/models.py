from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


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

