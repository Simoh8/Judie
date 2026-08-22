"""
Reusable Email Service for Flown Application
Provides a centralized way to send various types of emails with consistent styling
"""

from django.core.mail import send_mail
from django.conf import settings
from typing import Optional


class EmailService:
    """Centralized email service with templating capabilities"""
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        plain_message: str,
        html_message: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> bool:
        """
        Send an email using the configured email backend
        
        Args:
            to_email: Recipient email address
            subject: Email subject line
            plain_message: Plain text version of the email
            html_message: HTML version of the email (optional)
            from_email: Sender email address (defaults to DEFAULT_FROM_EMAIL)
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            from_email = from_email or getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@flown.com')
            send_mail(
                subject,
                plain_message,
                from_email,
                [to_email],
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Failed to send email to {to_email}: {e}")
            return False
    
    @staticmethod
    def generate_base_html_template(
        title: str,
        content: str,
        preheader: Optional[str] = None
    ) -> str:
        """
        Generate a base HTML email template with consistent styling
        
        Args:
            title: Email title (displayed in header)
            content: Main HTML content
            preheader: Optional preview text
            
        Returns:
            str: Complete HTML email
        """
        preheader_html = f'''
        <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
          {preheader}
        </div>
        ''' if preheader else ''
        
        return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
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
    .btn {{
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
    .card {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }}
  </style>
</head>
<body>
  {preheader_html}
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>{title}</h1>
      </div>
      <div class="content">
        {content}
      </div>
      <div class="footer">
        <p>&copy; 2026 Flown. All rights reserved.</p>
        <p>This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>'''
    
    @staticmethod
    def send_password_reset_email(
        to_email: str,
        user_name: str,
        reset_link: str
    ) -> bool:
        """
        Send password reset email with reset link
        
        Args:
            to_email: User's email address
            user_name: User's first name or email prefix
            reset_link: Password reset link
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = "Reset Your Flown Password"
        
        plain_message = f'''Hi {user_name},

We received a request to reset your password for your Flown account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

Thanks,
The Flown Team'''
        
        html_content = f'''
        <p style="font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #0f172a;">
          Hi {user_name},
        </p>
        <p style="font-size: 16px; line-height: 24px; color: #475569; margin-bottom: 24px;">
          We received a request to reset your password for your Flown account. Click the button below to securely reset your password.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_link}" target="_blank" class="btn">Reset Password</a>
        </div>
        
        <p style="font-size: 14px; line-height: 20px; color: #64748b; margin-bottom: 8px;">
          This link will expire in 1 hour for security reasons.
        </p>
        
        <div class="card">
          <p style="font-size: 14px; line-height: 20px; color: #64748b; margin: 0;">
            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 24px; color: #475569; margin-bottom: 0;">
          Thanks,<br>
          <strong>The Flown Team</strong>
        </p>
        '''
        
        html_message = EmailService.generate_base_html_template(
            title="Reset Your Password",
            content=html_content,
            preheader="Reset your Flown password"
        )
        
        return EmailService.send_email(to_email, subject, plain_message, html_message)
    
    @staticmethod
    def send_password_reset_confirmation_email(
        to_email: str,
        user_name: str
    ) -> bool:
        """
        Send confirmation email after successful password reset
        
        Args:
            to_email: User's email address
            user_name: User's first name or email prefix
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = "Your Flown Password Has Been Reset"
        
        plain_message = f'''Hi {user_name},

Your Flown password has been successfully reset.

If you didn't make this change, please contact our support team immediately.

Thanks,
The Flown Team'''
        
        html_content = f'''
        <p style="font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #0f172a;">
          Hi {user_name},
        </p>
        <p style="font-size: 16px; line-height: 24px; color: #475569; margin-bottom: 24px;">
          Your Flown password has been successfully reset.
        </p>
        
        <div class="card">
          <p style="font-size: 14px; line-height: 20px; color: #64748b; margin: 0;">
            If you didn't make this change, please contact our support team immediately.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 24px; color: #475569; margin-bottom: 0;">
          Thanks,<br>
          <strong>The Flown Team</strong>
        </p>
        '''
        
        html_message = EmailService.generate_base_html_template(
            title="Password Reset Successful",
            content=html_content,
            preheader="Your password has been reset"
        )
        
        return EmailService.send_email(to_email, subject, plain_message, html_message)
    
    @staticmethod
    def send_booking_confirmation_email(
        to_email: str,
        user_name: str,
        session_title: str,
        session_details: dict,
        zoom_details: dict
    ) -> bool:
        """
        Send booking confirmation email with session and Zoom details
        
        Args:
            to_email: User's email address
            user_name: User's first name or email prefix
            session_title: Session title
            session_details: Dictionary with session information
            zoom_details: Dictionary with Zoom meeting information
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = f"Booking Confirmed: {session_title}"
        
        scheduled_str = session_details.get('scheduled_for', '')
        duration = session_details.get('duration', '')
        session_type = session_details.get('type', '')
        facilitator = session_details.get('facilitator', '')
        
        zoom_join_url = zoom_details.get('join_url', '')
        zoom_meeting_id = zoom_details.get('meeting_id', '')
        zoom_password = zoom_details.get('password', '')
        
        plain_message = f'''Hi {user_name},

You have successfully booked the session "{session_title}".

Session Details:
- Title: {session_title}
- Type: {session_type}
- Scheduled: {scheduled_str}
- Duration: {duration} minutes
- Facilitator: {facilitator}

Zoom Meeting Details:
- Join URL: {zoom_join_url}
- Meeting ID: {zoom_meeting_id}
- Password: {zoom_password}

Please join the meeting a few minutes before the scheduled start time.

See you there!'''
        
        html_content = f'''
        <p class="greeting">Hi {user_name},</p>
        <p class="intro">You have successfully booked the session <strong>"{session_title}"</strong>. Here are your details and Zoom join link:</p>
        
        <div class="card">
          <div style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            Session Information
          </div>
          <div style="margin-bottom: 8px; font-size: 14px; line-height: 20px;">
            <span style="color: #64748b; font-weight: 500; display: inline-block; width: 120px;">Title</span>
            <span style="color: #0f172a; font-weight: 600;">{session_title}</span>
          </div>
          <div style="margin-bottom: 8px; font-size: 14px; line-height: 20px;">
            <span style="color: #64748b; font-weight: 500; display: inline-block; width: 120px;">Type</span>
            <span style="color: #0f172a; font-weight: 600;">{session_type}</span>
          </div>
          <div style="margin-bottom: 8px; font-size: 14px; line-height: 20px;">
            <span style="color: #64748b; font-weight: 500; display: inline-block; width: 120px;">Date & Time</span>
            <span style="color: #0f172a; font-weight: 600;">{scheduled_str}</span>
          </div>
          <div style="margin-bottom: 8px; font-size: 14px; line-height: 20px;">
            <span style="color: #64748b; font-weight: 500; display: inline-block; width: 120px;">Duration</span>
            <span style="color: #0f172a; font-weight: 600;">{duration} minutes</span>
          </div>
          <div style="margin-bottom: 8px; font-size: 14px; line-height: 20px;">
            <span style="color: #64748b; font-weight: 500; display: inline-block; width: 120px;">Facilitator</span>
            <span style="color: #0f172a; font-weight: 600;">{facilitator}</span>
          </div>
        </div>
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
          <div style="font-size: 16px; font-weight: 600; color: #1e40af; margin-top: 0; margin-bottom: 12px;">
            🎥 Zoom Meeting Details
          </div>
          <div style="font-size: 14px; color: #1e3a8a; margin-bottom: 16px; line-height: 1.5;">
            <div style="margin-bottom: 6px;"><strong>Meeting ID:</strong> {zoom_meeting_id}</div>
            <div><strong>Password:</strong> {zoom_password}</div>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <a href="{zoom_join_url}" target="_blank" class="btn">Join Zoom Call</a>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Please join the meeting a few minutes before the scheduled start time. See you there!</p>
        '''
        
        html_message = EmailService.generate_base_html_template(
            title="Booking Confirmed",
            content=html_content,
            preheader="Your session booking is confirmed"
        )
        
        return EmailService.send_email(to_email, subject, plain_message, html_message)