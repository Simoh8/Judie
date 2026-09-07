# Generated manually to enhance Purchase model with payment tracking features

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_package_trial_days'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchase',
            name='payment_method',
            field=models.CharField(
                choices=[('paystack', 'Paystack'), ('bank_transfer', 'Bank Transfer'), ('card', 'Card'), ('other', 'Other')],
                default='paystack',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='purchase',
            name='payment_date',
            field=models.DateTimeField(blank=True, null=True, help_text='Date when payment was actually completed'),
        ),
        migrations.AddField(
            model_name='purchase',
            name='invoice_number',
            field=models.CharField(blank=True, max_length=50, null=True, unique=True, help_text='Unique invoice number for tracking'),
        ),
        migrations.AddField(
            model_name='purchase',
            name='receipt_url',
            field=models.URLField(blank=True, null=True, help_text='URL to payment receipt'),
        ),
        migrations.AddField(
            model_name='purchase',
            name='reconciliation_status',
            field=models.CharField(
                choices=[('pending', 'Pending Reconciliation'), ('matched', 'Matched'), ('disputed', 'Disputed'), ('resolved', 'Resolved')],
                default='pending',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='purchase',
            name='admin_notes',
            field=models.TextField(blank=True, help_text='Admin notes for reconciliation purposes'),
        ),
        migrations.AddField(
            model_name='purchase',
            name='reconciled_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.SET_NULL,
                related_name='reconciled_purchases',
                to=settings.AUTH_USER_MODEL,
                help_text='Admin who reconciled this payment'
            ),
        ),
        migrations.AddField(
            model_name='purchase',
            name='reconciled_at',
            field=models.DateTimeField(blank=True, null=True, help_text='Date when payment was reconciled'),
        ),
    ]
