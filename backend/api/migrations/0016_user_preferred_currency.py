# Generated migration for adding preferred_currency to User model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_useractivity'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='preferred_currency',
            field=models.CharField(default='USD', help_text="User's preferred currency for payments", max_length=3),
        ),
    ]
