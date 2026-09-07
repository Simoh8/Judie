from django.core.management.base import BaseCommand
from api.models import SystemSettings
from cryptography.fernet import Fernet


class Command(BaseCommand):
    help = 'Initialize default system settings'

    def handle(self, *args, **options):
        default_settings = [
            # Frontend Settings
            {
                'key': 'app_name',
                'value': 'FOCUSED',
                'category': 'frontend',
                'setting_type': 'string',
                'description': 'Application name displayed in the UI',
                'is_encrypted': False,
                'is_public': True,
            },
            {
                'key': 'favicon_url',
                'value': '',
                'category': 'frontend',
                'setting_type': 'string',
                'description': 'URL to the favicon image',
                'is_encrypted': False,
                'is_public': True,
            },
            {
                'key': 'primary_color',
                'value': '#2563eb',
                'category': 'frontend',
                'setting_type': 'string',
                'description': 'Primary brand color (hex code)',
                'is_encrypted': False,
                'is_public': True,
            },
            {
                'key': 'max_upload_size_mb',
                'value': '10',
                'category': 'frontend',
                'setting_type': 'number',
                'description': 'Maximum file upload size in megabytes',
                'is_encrypted': False,
                'is_public': True,
            },
            # Backend Settings
            {
                'key': 'zoom_api_key',
                'value': '',
                'category': 'backend',
                'setting_type': 'encrypted',
                'description': 'Zoom API key for meeting integration',
                'is_encrypted': True,
                'is_public': False,
            },
            {
                'key': 'zoom_api_secret',
                'value': '',
                'category': 'backend',
                'setting_type': 'encrypted',
                'description': 'Zoom API secret for meeting integration',
                'is_encrypted': True,
                'is_public': False,
            },
            {
                'key': 'paystack_public_key',
                'value': '',
                'category': 'backend',
                'setting_type': 'encrypted',
                'description': 'Paystack public key for payments',
                'is_encrypted': True,
                'is_public': False,
            },
            {
                'key': 'paystack_secret_key',
                'value': '',
                'category': 'backend',
                'setting_type': 'encrypted',
                'description': 'Paystack secret key for payments',
                'is_encrypted': True,
                'is_public': False,
            },
            {
                'key': 'email_host',
                'value': 'smtp.gmail.com',
                'category': 'backend',
                'setting_type': 'string',
                'description': 'Email server host',
                'is_encrypted': False,
                'is_public': False,
            },
            {
                'key': 'email_port',
                'value': '587',
                'category': 'backend',
                'setting_type': 'number',
                'description': 'Email server port',
                'is_encrypted': False,
                'is_public': False,
            },
            {
                'key': 'email_host_user',
                'value': '',
                'category': 'backend',
                'setting_type': 'encrypted',
                'description': 'Email server username',
                'is_encrypted': True,
                'is_public': False,
            },
            {
                'key': 'email_host_password',
                'value': '',
                'category': 'backend',
                'setting_type': 'encrypted',
                'description': 'Email server password',
                'is_encrypted': True,
                'is_public': False,
            },
            # General Settings
            {
                'key': 'maintenance_mode',
                'value': 'false',
                'category': 'general',
                'setting_type': 'boolean',
                'description': 'Enable maintenance mode to disable user access',
                'is_encrypted': False,
                'is_public': True,
            },
            {
                'key': 'session_timeout_minutes',
                'value': '30',
                'category': 'general',
                'setting_type': 'number',
                'description': 'User session timeout in minutes',
                'is_encrypted': False,
                'is_public': False,
            },
            {
                'key': 'max_failed_login_attempts',
                'value': '5',
                'category': 'general',
                'setting_type': 'number',
                'description': 'Maximum failed login attempts before account lockout',
                'is_encrypted': False,
                'is_public': False,
            },
        ]

        created_count = 0
        updated_count = 0

        for setting_data in default_settings:
            setting, created = SystemSettings.objects.get_or_create(
                key=setting_data['key'],
                defaults=setting_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created setting: {setting.key}')
                )
            else:
                # Update existing setting with new values
                for key, value in setting_data.items():
                    if key != 'key':  # Don't update the key
                        setattr(setting, key, value)
                setting.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated setting: {setting.key}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully initialized {created_count} new settings and updated {updated_count} existing settings.'
            )
        )

        # Check if encryption key is set
        from django.conf import settings
        if not hasattr(settings, 'SETTINGS_ENCRYPTION_KEY') or not settings.SETTINGS_ENCRYPTION_KEY:
            key = Fernet.generate_key()
            self.stdout.write(
                self.style.WARNING(
                    f'\nNo encryption key found in settings. Add this to your .env file:\n'
                    f'SETTINGS_ENCRYPTION_KEY={key.decode()}'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('Encryption key is configured in settings.')
            )