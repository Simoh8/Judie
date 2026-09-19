# Subscription Reminders and PDF Invoice Setup Guide

This document provides instructions for setting up and configuring the subscription reminder system and PDF invoice generation.

## Features Implemented

### 1. Subscription Reminder Emails
- Automated cron job that sends renewal reminders to users
- Multiple reminder intervals (7 days, 3 days, 1 day before expiry)
- Professional email templates with styling
- Dry-run mode for testing

### 2. PDF Invoice Generation
- Automatic PDF invoice generation upon successful payment
- Professional invoice layout with company branding
- Stored in media directory for download
- Integrated with payment confirmation emails

### 3. Payment Confirmation Emails
- Automatic email sent when payment is completed
- Includes invoice download link
- Professional template with payment details

## Installation Requirements

### 1. Install Required Packages

```bash
cd backend
pip install reportlab==4.0.7
```

The `reportlab` package is required for PDF generation. It's already added to `requirements.txt`.

### 2. Configure Email Settings

Ensure your email settings are properly configured in your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
ADMIN_EMAIL=admin@flown.com
```

For Gmail, you'll need to use an App Password instead of your regular password:
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password for "Mail"
4. Use that password in `EMAIL_HOST_PASSWORD`

### 3. Configure Frontend URL

Set your frontend URL in `.env`:

```env
FRONTEND_URL=https://your-frontend-domain.com
```

This is used for generating links in emails (renewal links, invoice download links).

### 4. Configure Media Directory

Ensure the media directory exists and is writable:

```bash
cd backend
mkdir -p media/invoices
chmod 755 media
chmod 755 media/invoices
```

## Cron Job Configuration

The subscription reminders are configured using django-crontab in `settings.py`:

```python
CRONJOBS = [
    # Existing cron job for ongoing sessions
    ('0 * * * *', 'django.core.management.call_command', ['regenerate_ongoing_sessions'], {}, '>> /tmp/ongoing_sessions_cron.log'),
    
    # Subscription reminder cron jobs
    ('0 9 * * *', 'django.core.management.call_command', ['send_subscription_reminders', '--days=7'], {}, '>> /tmp/subscription_reminders_7days.log'),
    ('0 9 * * *', 'django.core.management.call_command', ['send_subscription_reminders', '--days=3'], {}, '>> /tmp/subscription_reminders_3days.log'),
    ('0 9 * * *', 'django.core.management.call_command', ['send_subscription_reminders', '--days=1'], {}, '>> /tmp/subscription_reminders_1day.log'),
]
```

### Cron Schedule Explanation

- `0 9 * * *` = Runs at 9:00 AM every day
- `--days=7` = Sends reminders for subscriptions expiring in 7 days
- `--days=3` = Sends reminders for subscriptions expiring in 3 days  
- `--days=1` = Sends reminders for subscriptions expiring in 1 day

### Testing the Cron Job

You can test the reminder system manually:

```bash
# Test with dry-run (no emails sent)
python manage.py send_subscription_reminders --days=7 --dry-run

# Test actual email sending
python manage.py send_subscription_reminders --days=7
```

### Production Cron Setup

For production, you can either:

1. **Use django-crontab** (already configured):
```bash
python manage.py crontab add
```

2. **Use system cron** (recommended for production):
```bash
# Edit crontab
crontab -e

# Add these lines:
0 9 * * * cd /path/to/backend && python manage.py send_subscription_reminders --days=7 >> /tmp/subscription_reminders_7days.log 2>&1
0 9 * * * cd /path/to/backend && python manage.py send_subscription_reminders --days=3 >> /tmp/subscription_reminders_3days.log 2>&1
0 9 * * * cd /path/to/backend && python manage.py send_subscription_reminders --days=1 >> /tmp/subscription_reminders_1day.log 2>&1
```

## PDF Invoice Storage

PDF invoices are stored in:
- Backend: `backend/media/invoices/`
- Access URL: `http://your-backend-domain.com/media/invoices/invoice_{purchase_id}_{invoice_number}.pdf`

### Media File Serving

The URL configuration already includes media file serving:

```python
if settings.DEBUG or True:  # Serve media files in development
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

For production, you'll want to:
1. Use a proper web server (nginx) to serve media files
2. Or use cloud storage (AWS S3, etc.)

## Email Templates

### Subscription Reminder Email
- Subject: "Your {package_name} subscription expires in {days} days"
- Includes: Package name, expiry date, renewal link
- Urgency indicators based on days remaining

### Payment Confirmation Email
- Subject: "Payment Confirmation: {invoice_number}"
- Includes: Package details, amount, invoice number, download link
- Professional styling with payment summary

## Manual Invoice Generation

You can manually generate invoices for existing purchases:

```python
from api.models import Purchase
from api.pdf_service import PDFInvoiceService

# Get a purchase
purchase = Purchase.objects.get(id=1)

# Generate invoice
invoice_url = PDFInvoiceService.generate_and_save_invoice(purchase)
print(f"Invoice generated: {invoice_url}")
```

## Troubleshooting

### Emails Not Sending

1. Check email configuration in `.env`
2. Verify email credentials are correct
3. Check firewall/port restrictions
4. Review logs: `/tmp/subscription_reminders_*.log`

### PDF Generation Fails

1. Ensure `reportlab` is installed: `pip install reportlab`
2. Check media directory permissions
3. Verify Python has write access to media directory

### Cron Jobs Not Running

1. Check django-crontab is properly installed
2. Verify cron schedule syntax
3. Check system logs for cron errors
4. Test command manually first

## Customization

### Modify Reminder Schedule

Edit `CRONJOBS` in `settings.py` to change:
- Times (currently 9:00 AM)
- Days before expiry (currently 7, 3, 1)
- Add additional reminder intervals

### Customize Email Templates

Edit methods in `api/email_service.py`:
- `send_subscription_reminder_email` for renewal reminders
- `send_payment_confirmation_email` for payment confirmations

### Customize Invoice Design

Edit `PDFInvoiceService.generate_invoice_pdf` in `api/pdf_service.py` to modify:
- Company information
- Invoice layout
- Styling and colors
- Additional fields

## Monitoring

### Check Cron Logs

```bash
# View recent cron logs
tail -f /tmp/subscription_reminders_7days.log
tail -f /tmp/subscription_reminders_3days.log
tail -f /tmp/subscription_reminders_1day.log
```

### Monitor Email Delivery

Check your email service provider's dashboard for:
- Delivery rates
- Bounce rates
- Spam complaints
- Open rates

## Security Considerations

1. **Email Credentials**: Store in environment variables, never commit to git
2. **Invoice Access**: Currently public - consider adding authentication for invoice downloads
3. **Rate Limiting**: Consider adding rate limiting for email sending
4. **PDF Storage**: Consider moving to cloud storage for better security and CDN

## Future Enhancements

1. **Multiple Reminder Frequencies**: Add weekly, monthly reminders
2. **Customizable Reminder Timing**: Allow users to choose when to receive reminders
3. **Invoice Branding**: Add company logo to PDF invoices
4. **Multiple Payment Methods**: Support other payment providers
5. **Automated Renewal**: Optional auto-renewal feature
6. **Reminder History**: Track when reminders were sent to avoid duplicates