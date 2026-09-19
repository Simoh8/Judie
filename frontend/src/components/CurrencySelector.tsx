"use client";

import { useState, useEffect } from "react";
import { DollarSign, Globe } from "lucide-react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  paystack_supported: boolean;
}

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: string) => void;
  showFullList?: boolean;
}

export default function CurrencySelector({ onCurrencyChange, showFullList = false }: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrencies();
    loadUserCurrency();
  }, []);

  const loadCurrencies = async () => {
    try {
      const response = await fetch('/api/currency');
      const data = await response.json();
      if (data.success && data.currencies) {
        setCurrencies(data.currencies);
      }
    } catch (error) {
      console.error("Failed to load currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserCurrency = () => {
    // Try to get user's preferred currency from user store or localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.preferredCurrency) {
          setSelectedCurrency(user.preferredCurrency);
        }
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setIsOpen(false);
    
    // Update user's preferred currency if logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/users/${user.id}/set_currency`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ currency: currencyCode })
        });

        const data = await response.json();
        if (data.success) {
          // Update local user data
          user.preferredCurrency = currencyCode;
          localStorage.setItem('user', JSON.stringify(user));
          
          if (onCurrencyChange) {
            onCurrencyChange(currencyCode);
          }
        }
      } catch (error) {
        console.error("Failed to update currency preference:", error);
      }
    } else {
      // For non-logged-in users, just store in localStorage
      localStorage.setItem('preferredCurrency', currencyCode);
      if (onCurrencyChange) {
        onCurrencyChange(currencyCode);
      }
    }
  };

  const getSelectedCurrency = () => {
    return currencies.find(c => c.code === selectedCurrency) || currencies[0];
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-foreground/60">
        <DollarSign size={16} />
        <span>Loading...</span>
      </div>
    );
  }

  const selected = getSelectedCurrency();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ios-gray-100 dark:bg-ios-gray-800 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-700 transition-colors"
      >
        <Globe size={16} className="text-foreground/60" />
        <span className="text-sm font-medium">
          {selected?.symbol} {selected?.code}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-ios-gray-900 rounded-xl shadow-lg border border-ios-gray-200 dark:border-ios-gray-800 z-50">
          <div className="p-3 border-b border-ios-gray-200 dark:border-ios-gray-800">
            <h3 className="text-sm font-semibold text-foreground">Select Currency</h3>
            <p className="text-xs text-foreground/60">Prices will be displayed in your chosen currency</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`w-full px-4 py-3 text-left hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors ${
                  selectedCurrency === currency.code ? 'bg-ios-blue/10 dark:bg-ios-blue/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium">{currency.symbol}</span>
                    <div>
                      <div className="text-sm font-medium text-foreground">{currency.name}</div>
                      <div className="text-xs text-foreground/60">{currency.code}</div>
                    </div>
                  </div>
                  {currency.paystack_supported && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">
                      Paystack
                    </span>
                  )}
                </div>
                <div className="text-xs text-foreground/60 mt-1">
                  1 USD = {currency.rate.toFixed(2)} {currency.code}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
