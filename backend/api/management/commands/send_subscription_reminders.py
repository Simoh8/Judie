"""
Django management command to send subscription renewal reminders
Run this command periodically via cron job to notify users about expiring subscriptions
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from api.models import Purchase, User
from api.email_service import EmailService


class Command(BaseCommand):
    help = 'Send subscription renewal reminder emails to users with expiring subscriptions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days before expiry to send reminders (default: 7)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually sending emails (for testing)'
        )

    def handle(self, *args, **options):
        days_before = options['days']
        dry_run = options['dry_run']
        
        self.stdout.write(f"Checking for subscriptions expiring in {days_before} days...")
        
        # Calculate the date range for expiring subscriptions
        today = timezone.now().date()
        expiry_date = today + timedelta(days=days_before)
        
        # Find active purchases that will expire on the target date
        expiring_purchases = Purchase.objects.filter(
            status='completed',
            valid_until__date=expiry_date
        ).select_related('user', 'package')
        
        count = expiring_purchases.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS(f"No subscriptions expiring in {days_before} days."))
            return
        
        self.stdout.write(f"Found {count} subscription(s) expiring in {days_before} days.")
        
        # Track statistics
        sent_count = 0
        failed_count = 0
        already_sent = 0
        
        for purchase in expiring_purchases:
            user = purchase.user
            package = purchase.package
            
            # Check if we've already sent a reminder for this purchase
            # You could add a field to track this, but for now we'll send based on days
            user_name = user.first_name if user.first_name else user.email.split('@')[0]
            
            # Format the expiry date
            expiry_date_str = purchase.valid_until.strftime('%B %d, %Y')
            
            # Create renewal link (you may need to adjust this based on your frontend URL)
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            renewal_link = f"{frontend_url}/pricing"
            
            if dry_run:
                self.stdout.write(
                    f"[DRY RUN] Would send reminder to {user.email} for {package.name} "
                    f"expiring on {expiry_date_str}"
                )
                sent_count += 1
            else:
                # Send the reminder email
                success = EmailService.send_subscription_reminder_email(
                    to_email=user.email,
                    user_name=user_name,
                    package_name=package.name,
                    expiry_date=expiry_date_str,
                    renewal_link=renewal_link,
                    days_remaining=days_before
                )
                
                if success:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Sent reminder to {user.email} for {package.name}"
                        )
                    )
                    sent_count += 1
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f"✗ Failed to send reminder to {user.email} for {package.name}"
                        )
                    )
                    failed_count += 1
        
        # Summary
        self.stdout.write("\n" + "="*50)
        self.stdout.write("Summary:")
        self.stdout.write(f"  Total expiring subscriptions: {count}")
        self.stdout.write(f"  Reminders sent: {sent_count}")
        self.stdout.write(f"  Failed: {failed_count}")
        if dry_run:
            self.stdout.write(f"  (Dry run - no emails actually sent)")
        self.stdout.write("="*50)
        
        if failed_count > 0 and not dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"{failed_count} reminder(s) failed to send. Please check your email configuration."
                )
            )