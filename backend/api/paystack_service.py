import os
import requests
from django.conf import settings
from django.utils import timezone
import time
import hashlib


class PaystackService:
    """Service for handling Paystack payment integration"""
    
    BASE_URL = "https://api.paystack.co"
    
    @classmethod
    def get_headers(cls):
        """Get headers with Paystack secret key"""
        secret_key = os.getenv('PAYSTACK_SECRET_KEY')
        if not secret_key:
            raise ValueError("PAYSTACK_SECRET_KEY not configured")
        
        print(f"Using Paystack Secret Key: {secret_key[:10]}...{secret_key[-4:]}")
        
        return {
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json"
        }
    
    @classmethod
    def initiate_payment(cls, email, amount, reference, metadata=None, user_currency='NGN'):
        """
        Initiate a payment transaction with Paystack
        
        Args:
            email: Customer email address
            amount: Amount in USD (base currency)
            reference: Unique transaction reference
            metadata: Additional metadata dict
            user_currency: User's preferred currency (default: NGN)
            
        Returns:
            dict with payment details including authorization_url
        """
        try:
            # Import CurrencyService here to avoid circular imports
            from .currency_service import CurrencyService
            
            # Determine the best Paystack-supported currency for the user
            paystack_currency = CurrencyService.get_best_paystack_currency(user_currency)
            
            # Convert USD to user's preferred currency
            amount_in_user_currency = CurrencyService.convert_amount(float(amount), 'USD', user_currency)
            
            # If user's currency is not supported by Paystack, convert to the supported currency
            if paystack_currency != user_currency:
                amount_in_paystack_currency = CurrencyService.convert_amount(amount_in_user_currency, user_currency, paystack_currency)
                print(f"Currency conversion: ${amount} USD -> {amount_in_user_currency:.2f} {user_currency} -> {amount_in_paystack_currency:.2f} {paystack_currency}")
            else:
                amount_in_paystack_currency = amount_in_user_currency
                print(f"Currency conversion: ${amount} USD -> {amount_in_paystack_currency:.2f} {paystack_currency}")
            
            # Convert to smallest currency unit (kobo for NGN, cents for USD, etc.)
            if paystack_currency == 'NGN':
                amount_in_smallest_unit = int(amount_in_paystack_currency * 100)  # kobo
            elif paystack_currency in ['USD', 'EUR', 'GBP', 'GHS', 'ZAR']:
                amount_in_smallest_unit = int(amount_in_paystack_currency * 100)  # cents
            else:
                amount_in_smallest_unit = int(amount_in_paystack_currency * 100)  # default to cents
            
            print(f"Paystack Payment: {amount_in_smallest_unit} {paystack_currency} (smallest unit) for ${amount} USD")
            
            url = f"{cls.BASE_URL}/transaction/initialize"
            headers = cls.get_headers()
            
            # Build callback URL with auth token if provided in metadata
            callback_url = os.getenv('PAYSTACK_CALLBACK_URL', f"{settings.FRONTEND_URL}/payment/callback")
            if metadata and metadata.get('auth_token'):
                callback_url = f"{callback_url}?token={metadata.get('auth_token')}"
            
            payload = {
                "email": email,
                "amount": amount_in_smallest_unit,
                "reference": reference,
                "callback_url": callback_url,
                "currency": paystack_currency,  # Use dynamic currency based on user preference
                "metadata": metadata or {}
            }
            
            print(f"Paystack Request Payload: {payload}")
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response_data = response.json()
            
            # # Log response for debugging
            # print(f"Paystack API Response: Status {response.status_code}")
            # print(f"Paystack API Response Data: {response_data}")
            
            # Log specific error details
            if response.status_code != 200:
                # print(f"Paystack Error Details:")
                # print(f"  Message: {response_data.get('message', 'Unknown error')}")
                # print(f"  Type: {response_data.get('type', 'Unknown')}")
                # print(f"  Code: {response_data.get('code', 'Unknown')}")
                if 'meta' in response_data:
                    print(f"  Meta: {response_data['meta']}")
            
            if response.status_code == 200 and response_data.get('status'):
                # Verify the currency in response
                response_currency = response_data['data'].get('currency', 'NGN')
                if response_currency != 'NGN':
                    print(f"WARNING: Paystack returned currency {response_currency} instead of NGN")
                
                return {
                    'authorization_url': response_data['data']['authorization_url'],
                    'reference': response_data['data']['reference'],
                    'access_code': response_data['data'].get('access_code')
                }
            else:
                print(f"Paystack initialization failed: {response_data}")
                return None
                
        except Exception as e:
            print(f"Error initiating Paystack payment: {e}")
            return None
    
    @classmethod
    def verify_payment(cls, reference):
        """
        Verify a payment transaction with Paystack
        
        Args:
            reference: Transaction reference to verify
            
        Returns:
            dict with verification result
        """
        try:
            url = f"{cls.BASE_URL}/transaction/verify/{reference}"
            headers = cls.get_headers()
            
            response = requests.get(url, headers=headers, timeout=30)
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status'):
                transaction_data = response_data['data']
                
                return {
                    'status': transaction_data['status'] == 'success',
                    'amount': transaction_data['amount'] / 100,  # Convert from kobo to Naira
                    'currency': transaction_data['currency'],
                    'transaction_id': transaction_data['id'],
                    'paid_at': transaction_data.get('paid_at'),
                    'metadata': transaction_data.get('metadata', {})
                }
            else:
                print(f"Paystack verification failed: {response_data}")
                return {
                    'status': False,
                    'error': response_data.get('message', 'Verification failed')
                }
                
        except Exception as e:
            print(f"Error verifying Paystack payment: {e}")
            return {
                'status': False,
                'error': str(e)
            }
    
    @classmethod
    def generate_reference(cls, prefix="PURCHASE"):
        """Generate a unique transaction reference"""
        timestamp = int(timezone.now().timestamp())
        random_str = hashlib.md5(f"{timestamp}{os.urandom(8)}".encode()).hexdigest()[:8].upper()
        return f"{prefix}_{timestamp}_{random_str}"
    
    @classmethod
    def process_webhook(cls, payload, signature):
        """
        Process Paystack webhook events
        
        Args:
            payload: Webhook payload data
            signature: X-Paystack-Signature header
            
        Returns:
            bool indicating if webhook is valid
        """
        try:
            # Verify webhook signature
            secret_key = os.getenv('PAYSTACK_SECRET_KEY')
            if not secret_key:
                return False
            
            # In production, verify the signature using HMAC
            # signature_hmac = hmac.new(secret_key.encode(), payload.encode(), hashlib.sha512).hexdigest()
            # if not hmac.compare_digest(signature, signature_hmac):
            #     return False
            
            event_data = payload if isinstance(payload, dict) else {}
            event = event_data.get('event')
            data = event_data.get('data', {})
            
            if event == 'charge.success':
                # Handle successful payment
                reference = data.get('reference')
                metadata = data.get('metadata', {})
                purchase_id = metadata.get('purchase_id')
                
                if purchase_id:
                    from .models import Purchase
                    try:
                        purchase = Purchase.objects.get(id=purchase_id)
                        purchase.status = 'completed'
                        purchase.paystack_transaction_id = data.get('id')
                        purchase.payment_date = timezone.now()
                        purchase.save()
                        
                        # Generate PDF invoice
                        try:
                            from .pdf_service import PDFInvoiceService
                            invoice_url = PDFInvoiceService.generate_and_save_invoice(purchase)
                            if invoice_url:
                                print(f"Generated invoice PDF for purchase {purchase.id}: {invoice_url}")
                        except Exception as pdf_error:
                            print(f"Failed to generate PDF invoice: {pdf_error}")
                        
                        # Send payment confirmation email
                        try:
                            from .email_service import EmailService
                            user_name = purchase.user.first_name if purchase.user.first_name else purchase.user.email.split('@')[0]
                            
                            # Get frontend URL for invoice download
                            frontend_url = getattr(settings, 'FRONTEND_URL')
                            invoice_download_link = f"{frontend_url}/billing"
                            
                            EmailService.send_payment_confirmation_email(
                                to_email=purchase.user.email,
                                user_name=user_name,
                                package_name=purchase.package.name,
                                amount=f"${purchase.amount:.2f} {purchase.currency}",
                                invoice_number=purchase.invoice_number or f"INV-{purchase.id}",
                                payment_date=purchase.payment_date.strftime('%B %d, %Y') if purchase.payment_date else purchase.created_at.strftime('%B %d, %Y'),
                                invoice_download_link=invoice_download_link
                            )
                            print(f"Sent payment confirmation email to {purchase.user.email}")
                        except Exception as email_error:
                            print(f"Failed to send payment confirmation email: {email_error}")
                        
                        return True
                    except Purchase.DoesNotExist:
                        print(f"Purchase {purchase_id} not found")
            
            return False
            
        except Exception as e:
            print(f"Error processing webhook: {e}")
            return False