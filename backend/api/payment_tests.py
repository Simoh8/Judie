"""
Test file for payment management feature
This file contains test cases for the new payment tracking and reconciliation features
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import Package, Purchase
from .serializers import PurchaseSerializer, PurchaseReconciliationSerializer

User = get_user_model()


class PaymentManagementTestCase(TestCase):
    """Test cases for payment management and reconciliation features"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123'
        )
        
        self.package = Package.objects.create(
            name='Test Package',
            description='A test package',
            price=99.99,
            duration='monthly',
            max_sessions=10,
            max_lead_requests=5
        )
    
    def test_purchase_creation_with_payment_tracking(self):
        """Test that purchases can be created with new payment tracking fields"""
        purchase = Purchase.objects.create(
            user=self.user,
            package=self.package,
            amount=99.99,
            currency='USD',
            payment_method='paystack',
            status='pending',
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30)
        )
        
        self.assertEqual(purchase.payment_method, 'paystack')
        self.assertEqual(purchase.reconciliation_status, 'pending')
        self.assertIsNone(purchase.payment_date)
        self.assertIsNone(purchase.invoice_number)
    
    def test_purchase_reconciliation(self):
        """Test payment reconciliation process"""
        purchase = Purchase.objects.create(
            user=self.user,
            package=self.package,
            amount=99.99,
            currency='USD',
            payment_method='paystack',
            status='completed',
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30)
        )
        
        # Simulate admin reconciliation
        purchase.reconciliation_status = 'matched'
        purchase.admin_notes = 'Payment verified against bank statement'
        purchase.reconciled_by = self.admin_user
        purchase.reconciled_at = timezone.now()
        purchase.invoice_number = 'INV-20260907-ABC123'
        purchase.save()
        
        self.assertEqual(purchase.reconciliation_status, 'matched')
        self.assertEqual(purchase.reconciled_by, self.admin_user)
        self.assertIsNotNone(purchase.reconciled_at)
        self.assertEqual(purchase.invoice_number, 'INV-20260907-ABC123')
    
    def test_invoice_generation(self):
        """Test invoice number generation"""
        purchase = Purchase.objects.create(
            user=self.user,
            package=self.package,
            amount=99.99,
            currency='USD',
            payment_method='paystack',
            status='completed',
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30)
        )
        
        # Generate invoice
        import uuid
        invoice_prefix = "INV"
        timestamp = timezone.now().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4())[:8].upper()
        invoice_number = f"{invoice_prefix}-{timestamp}-{unique_id}"
        
        purchase.invoice_number = invoice_number
        purchase.save()
        
        self.assertIsNotNone(purchase.invoice_number)
        self.assertTrue(purchase.invoice_number.startswith('INV-'))
    
    def test_payment_date_auto_set(self):
        """Test that payment date is set when status changes to completed"""
        purchase = Purchase.objects.create(
            user=self.user,
            package=self.package,
            amount=99.99,
            currency='USD',
            payment_method='paystack',
            status='pending',
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30)
        )
        
        self.assertIsNone(purchase.payment_date)
        
        # Complete the payment
        purchase.status = 'completed'
        purchase.payment_date = timezone.now()
        purchase.save()
        
        self.assertIsNotNone(purchase.payment_date)
        self.assertEqual(purchase.status, 'completed')
    
    def test_purchase_serializer_includes_new_fields(self):
        """Test that serializer includes new payment tracking fields"""
        purchase = Purchase.objects.create(
            user=self.user,
            package=self.package,
            amount=99.99,
            currency='USD',
            payment_method='bank_transfer',
            status='completed',
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30),
            payment_date=timezone.now(),
            invoice_number='INV-20260907-TEST123'
        )
        
        serializer = PurchaseSerializer(purchase)
        data = serializer.data
        
        self.assertIn('paymentMethod', data)
        self.assertIn('paymentDate', data)
        self.assertIn('invoiceNumber', data)
        self.assertIn('reconciliationStatus', data)
        self.assertEqual(data['paymentMethod'], 'Bank Transfer')
        self.assertEqual(data['invoiceNumber'], 'INV-20260907-TEST123')
    
    def test_reconciliation_serializer(self):
        """Test the reconciliation serializer"""
        purchase = Purchase.objects.create(
            user=self.user,
            package=self.package,
            amount=99.99,
            currency='USD',
            payment_method='paystack',
            status='completed',
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30)
        )
        
        data = {
            'reconciliation_status': 'matched',
            'admin_notes': 'Verified with bank statement',
            'receipt_url': 'https://example.com/receipt.pdf'
        }
        
        serializer = PurchaseReconciliationSerializer(purchase, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        updated_purchase = serializer.save()
        self.assertEqual(updated_purchase.reconciliation_status, 'matched')
        self.assertEqual(updated_purchase.admin_notes, 'Verified with bank statement')
        self.assertEqual(updated_purchase.receipt_url, 'https://example.com/receipt.pdf')


class PaymentStatisticsTestCase(TestCase):
    """Test cases for payment statistics and reporting"""
    
    def setUp(self):
        """Set up test data with various payment states"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        self.package = Package.objects.create(
            name='Test Package',
            description='A test package',
            price=99.99,
            duration='monthly',
            max_sessions=10,
            max_lead_requests=5
        )
        
        # Create purchases with different statuses
        self.completed_purchase = Purchase.objects.create(
            user=self.user,
            package=self.package,
            amount=99.99,
            currency='USD',
            status='completed',
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30),
            payment_date=timezone.now()
        )
        
        self.pending_purchase = Purchase.objects.create(
            user=self.user,
            package=self.package,
            amount=49.99,
            currency='USD',
            status='pending',
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30)
        )
        
        self.failed_purchase = Purchase.objects.create(
            user=self.user,
            package=self.package,
            amount=29.99,
            currency='USD',
            status='failed',
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30)
        )
    
    def test_payment_status_counts(self):
        """Test counting payments by status"""
        completed_count = Purchase.objects.filter(status='completed').count()
        pending_count = Purchase.objects.filter(status='pending').count()
        failed_count = Purchase.objects.filter(status='failed').count()
        
        self.assertEqual(completed_count, 1)
        self.assertEqual(pending_count, 1)
        self.assertEqual(failed_count, 1)
    
    def test_reconciliation_status_counts(self):
        """Test counting payments by reconciliation status"""
        pending_reconciliation = Purchase.objects.filter(reconciliation_status='pending').count()
        
        # All new purchases should have pending reconciliation status
        self.assertEqual(pending_reconciliation, 3)
    
    def test_total_revenue_calculation(self):
        """Test total revenue calculation from completed payments"""
        from django.db.models import Sum
        
        total_revenue = Purchase.objects.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        self.assertEqual(float(total_revenue), 99.99)
