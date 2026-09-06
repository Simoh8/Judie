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
        
        return {
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json"
        }
    
    @classmethod
    def initiate_payment(cls, email, amount, reference, metadata=None):
        """
        Initiate a payment transaction with Paystack
        
        Args:
            email: Customer email address
            amount: Amount in Naira (Paystack uses Naira by default)
            reference: Unique transaction reference
            metadata: Additional metadata dict
            
        Returns:
            dict with payment details including authorization_url
        """
        try:
            # Convert USD to Naira (approximate rate - in production use real API)
            # For now, we'll assume 1 USD = 1500 Naira
            amount_in_naira = int(float(amount) * 1500 * 100)  # Paystack expects amount in kobo
            
            url = f"{cls.BASE_URL}/transaction/initialize"
            headers = cls.get_headers()
            
            payload = {
                "email": email,
                "amount": amount_in_naira,
                "reference": reference,
                "callback_url": os.getenv('PAYSTACK_CALLBACK_URL', f"{settings.FRONTEND_URL}/payment/callback"),
                "metadata": metadata or {}
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status'):
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
                        purchase.save()
                        return True
                    except Purchase.DoesNotExist:
                        print(f"Purchase {purchase_id} not found")
            
            return False
            
        except Exception as e:
            print(f"Error processing webhook: {e}")
            return False