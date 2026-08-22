# Generated migration for password reset fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_session_zoom_join_url_session_zoom_meeting_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='password_reset_token',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='password_reset_token_expires',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]