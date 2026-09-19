import os
import requests
from django.conf import settings
from django.core.cache import cache
import time


class CurrencyService:
    """Service for handling currency conversion with real-time exchange rates for worldwide support"""
    
    # Cache exchange rates for 1 hour to avoid excessive API calls
    CACHE_TIMEOUT = 3600  # 1 hour in seconds
    
    # Common fallback rates if API fails (base: USD)
    FALLBACK_RATES = {
        'NGN': 1500,  # Nigerian Naira
        'KES': 130,   # Kenyan Shilling  
        'GHS': 12,    # Ghanaian Cedi
        'EUR': 0.85,  # Euro
        'GBP': 0.75,  # British Pound
        'CAD': 1.25,  # Canadian Dollar
        'AUD': 1.35,  # Australian Dollar
        'JPY': 110,   # Japanese Yen
        'INR': 75,    # Indian Rupee
        'ZAR': 15,    # South African Rand
    }
    
    # Paystack supported currencies (configurable via environment variable)
    @classmethod
    def get_paystack_supported_currencies(cls):
        """Get list of Paystack-supported currencies from environment or default"""
        env_currencies = os.getenv('PAYSTACK_SUPPORTED_CURRENCIES', 'NGN')
        currencies = [currency.strip().upper() for currency in env_currencies.split(',')]
        print(f"Paystack supported currencies: {currencies}")
        return currencies
    
    @classmethod
    def get_exchange_rate(cls, from_currency='USD', to_currency='NGN'):
        """
        Get current exchange rate between two currencies with caching
        
        Args:
            from_currency: Source currency code (default: USD)
            to_currency: Target currency code (default: NGN)
            
        Returns:
            float: Exchange rate
        """
        # Normalize currency codes
        from_currency = from_currency.upper()
        to_currency = to_currency.upper()
        
        if from_currency == to_currency:
            return 1.0
        
        cache_key = f"exchange_rate_{from_currency}_{to_currency}"
        
        # Try to get from cache first
        cached_rate = cache.get(cache_key)
        if cached_rate is not None:
            return cached_rate
        
        # Fetch from API
        rate = cls._fetch_exchange_rate_from_api(from_currency, to_currency)
        
        # Cache the rate
        if rate:
            cache.set(cache_key, rate, cls.CACHE_TIMEOUT)
        else:
            # Use fallback rate if API fails
            rate = cls._get_fallback_rate(from_currency, to_currency)
            cache.set(cache_key, rate, cls.CACHE_TIMEOUT)
            print(f"Currency API failed, using fallback rate: {rate}")
        
        return rate
    
    @classmethod
    def _get_fallback_rate(cls, from_currency='USD', to_currency='NGN'):
        """
        Get fallback exchange rate if API fails
        
        Args:
            from_currency: Source currency code
            to_currency: Target currency code
            
        Returns:
            float: Fallback exchange rate
        """
        # If both are in fallback rates, calculate the ratio
        if from_currency in cls.FALLBACK_RATES and to_currency in cls.FALLBACK_RATES:
            return cls.FALLBACK_RATES[to_currency] / cls.FALLBACK_RATES[from_currency]
        
        # If from_currency is USD, use direct fallback
        if from_currency == 'USD' and to_currency in cls.FALLBACK_RATES:
            return cls.FALLBACK_RATES[to_currency]
        
        # If to_currency is USD, use inverse
        if to_currency == 'USD' and from_currency in cls.FALLBACK_RATES:
            return 1.0 / cls.FALLBACK_RATES[from_currency]
        
        # Default fallback for unknown currencies
        print(f"No fallback rate for {from_currency} to {to_currency}, using 1.0")
        return 1.0
    
    @classmethod
    def _fetch_exchange_rate_from_api(cls, from_currency='USD', to_currency='NGN'):
        """
        Fetch exchange rate from external API
        
        Args:
            from_currency: Source currency code
            to_currency: Target currency code
            
        Returns:
            float: Exchange rate or None if failed
        """
        try:
            # Try ExchangeRate-API (free, no API key required, supports all currencies)
            url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                rate = data.get('rates', {}).get(to_currency)
                if rate:
                    print(f"Fetched exchange rate from ExchangeRate-API: 1 {from_currency} = {rate} {to_currency}")
                    return rate
                else:
                    print(f"ExchangeRate-API: Currency {to_currency} not found in response")
            
        except Exception as e:
            print(f"ExchangeRate-API failed: {e}")
        
        try:
            # Try fixer.io as backup (requires API key, supports 170+ currencies)
            api_key = os.getenv('FIXER_API_KEY')
            if api_key:
                url = f"http://data.fixer.io/api/latest?access_key={api_key}&base={from_currency}&symbols={to_currency}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        rate = data.get('rates', {}).get(to_currency)
                        if rate:
                            print(f"Fetched exchange rate from Fixer.io: 1 {from_currency} = {rate} {to_currency}")
                            return rate
                    else:
                        print(f"Fixer.io API error: {data.get('error', {}).get('info')}")
            
        except Exception as e:
            print(f"Fixer.io API failed: {e}")
        
        return None
    
    @classmethod
    def convert_amount(cls, amount, from_currency='USD', to_currency='NGN'):
        """
        Convert amount from one currency to another
        
        Args:
            amount: Amount to convert
            from_currency: Source currency code (default: USD)
            to_currency: Target currency code (default: NGN)
            
        Returns:
            float: Converted amount
        """
        from_currency = from_currency.upper()
        to_currency = to_currency.upper()
        
        if from_currency == to_currency:
            return amount
        
        rate = cls.get_exchange_rate(from_currency, to_currency)
        return amount * rate
    
    @classmethod
    def is_paystack_supported(cls, currency_code):
        """
        Check if a currency is supported by Paystack
        
        Args:
            currency_code: Currency code to check
            
        Returns:
            bool: True if supported by Paystack
        """
        supported_currencies = cls.get_paystack_supported_currencies()
        return currency_code.upper() in supported_currencies
    
    @classmethod
    def get_best_paystack_currency(cls, user_currency):
        """
        Get the best Paystack-supported currency for a user
        If user's currency is not supported, default to the first supported currency
        
        Args:
            user_currency: User's preferred currency code
            
        Returns:
            str: Best Paystack-supported currency code
        """
        user_currency = user_currency.upper()
        
        if cls.is_paystack_supported(user_currency):
            return user_currency
        
        # Get the list of supported currencies and return the first one as default
        supported_currencies = cls.get_paystack_supported_currencies()
        if supported_currencies:
            # Always default to the first supported currency (usually NGN for Paystack)
            return supported_currencies[0]
        
        # Ultimate fallback to NGN (most common Paystack currency)
        return 'NGN'
    
    @classmethod
    def get_currency_symbol(cls, currency_code):
        """
        Get currency symbol for a currency code
        
        Args:
            currency_code: Currency code
            
        Returns:
            str: Currency symbol
        """
        symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'NGN': '₦',
            'KES': 'KSh',
            'GHS': 'GH₵',
            'ZAR': 'R',
            'CAD': 'C$',
            'AUD': 'A$',
            'JPY': '¥',
            'INR': '₹',
            'CNY': '¥',
        }
        return symbols.get(currency_code.upper(), currency_code)
    
    @classmethod
    def clear_cache(cls):
        """Clear the exchange rate cache"""
        cache.delete_pattern("exchange_rate_*")
        print("Currency exchange rate cache cleared")
    
    @classmethod
    def get_supported_currencies(cls):
        """
        Get list of commonly supported currencies for the UI
        
        Returns:
            list: List of currency codes
        """
        return [
            {'code': 'USD', 'name': 'US Dollar', 'symbol': '$'},
            {'code': 'EUR', 'name': 'Euro', 'symbol': '€'},
            {'code': 'GBP', 'name': 'British Pound', 'symbol': '£'},
            {'code': 'NGN', 'name': 'Nigerian Naira', 'symbol': '₦'},
            {'code': 'KES', 'name': 'Kenyan Shilling', 'symbol': 'KSh'},
            {'code': 'GHS', 'name': 'Ghanaian Cedi', 'symbol': 'GH₵'},
            {'code': 'ZAR', 'name': 'South African Rand', 'symbol': 'R'},
            {'code': 'CAD', 'name': 'Canadian Dollar', 'symbol': 'C$'},
            {'code': 'AUD', 'name': 'Australian Dollar', 'symbol': 'A$'},
            {'code': 'JPY', 'name': 'Japanese Yen', 'symbol': '¥'},
            {'code': 'INR', 'name': 'Indian Rupee', 'symbol': '₹'},
        ]
