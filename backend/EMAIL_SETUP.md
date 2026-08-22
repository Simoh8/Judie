# Email Configuration Setup

The Flown application now includes email functionality for password reset and other notifications. This guide explains how to configure email settings.

## Email Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@flown.com
ADMIN_EMAIL=admin@flown.com
```

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate an App Password**:
   - Go to Google Account settings → Security
   - Enable 2-Step Verification if not already enabled
   - Go to "App passwords" section
   - Create a new app password (select "Mail" and your device)
   - Copy the 16-character password

3. **Update Environment Variables**:
   - `EMAIL_HOST_USER`: Your Gmail address
   - `EMAIL_HOST_PASSWORD`: The app password you generated

### Other Email Providers

You can use any SMTP provider by updating the following variables:

- **SMTP服务器**: `EMAIL_HOST`
- **端口**: `EMAIL_PORT` (typically 587 for TLS, 465 for SSL)
- **用户名**: `EMAIL_HOST_USER`
- **密码**: `EMAIL_HOST_PASSWORD`

## Email Features

### 1. Password Reset
- Users can request password reset via `/forgot-password`
- System sends reset link with 1-hour expiration
- Users can reset password via `/reset-password?token=...`

### 2. Booking Confirmations
- Automatic email when users book sessions
- Includes session details and Zoom meeting information

### 3. Lead Request Notifications
- Admin notifications when users request to lead sessions

## Email Service Component

The `EmailService` class in `backend/api/email_service.py` provides a reusable email component with:

- **Consistent HTML email templates** with professional styling
- **Pre-built email types**:
  - `send_password_reset_email()` - Password reset links
  - `send_password_reset_confirmation_email()` - Reset confirmation
  - `send_booking_confirmation_email()` - Booking confirmations
  - `send_email()` - Generic email sending
- **Responsive email design** that works on all devices
- **Easy to extend** for new email types

## Adding New Email Types

To add a new email type, add a method to the `EmailService` class:

```python
@staticmethod
def send_custom_email(to_email: str, user_name: str, data: dict) -> bool:
    subject = "Your Subject Here"
    
    plain_message = f"Plain text version..."
    
    html_content = f"""
    <p>Hi {user_name},</p>
    <p>Your HTML content here...</p>
    """
    
    html_message = EmailService.generate_base_html_template(
        title="Email Title",
        content=html_content,
        preheader="Preview text"
    )
    
    return EmailService.send_email(to_email, subject, plain_message, html_message)
```

## Testing Email Functionality

1. **Start the Django backend**: Ensure your `.env` file is properly configured
2. **Run migrations**: `python manage.py migrate`
3. **Test password reset**: 
   - Go to `/forgot-password` in your frontend
   - Enter an email address
   - Check your email for the reset link
4. **Test email sending**: Check Django logs for any email sending errors

## Troubleshooting

### Email not sending:
- Verify SMTP credentials are correct
- Check if your email provider requires app passwords
- Ensure `EMAIL_HOST` and `EMAIL_PORT` are correct
- Check firewall/network settings

### Gmail authentication errors:
- Make sure 2-factor authentication is enabled
- Use an app password, not your regular password
- Check if "Less secure apps" is blocked (use app password instead)

### Links not working in emails:
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Ensure URLs are properly formatted with `http://` or `https://`

## Security Notes

- **Never commit real email credentials** to version control
- **Use app passwords** instead of regular passwords when possible
- **Consider using transactional email services** (SendGrid, Mailgun) for production
- **Keep app passwords secure** and rotate them periodically
- **Monitor email sending** for unusual activity