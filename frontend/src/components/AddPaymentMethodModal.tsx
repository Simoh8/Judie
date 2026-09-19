"use client";

import { useState } from "react";
import { X, CreditCard, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPaymentMethodModal({ isOpen, onClose, onSuccess }: AddPaymentMethodModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardHolder: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate card number (basic validation)
      const cardNumberDigits = formData.cardNumber.replace(/\s/g, "");
      if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
        throw new Error("Invalid card number");
      }

      // Validate expiry
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(formData.expiryYear);
      const expiryMonth = parseInt(formData.expiryMonth);

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        throw new Error("Card has expired");
      }

      // Get last 4 digits
      const last4 = cardNumberDigits.slice(-4);

      // Detect card brand (simple detection)
      let cardBrand = "visa";
      if (cardNumberDigits.startsWith("4")) cardBrand = "visa";
      else if (cardNumberDigits.startsWith("5") || cardNumberDigits.startsWith("2")) cardBrand = "mastercard";
      else if (cardNumberDigits.startsWith("3")) cardBrand = "amex";
      else if (cardNumberDigits.startsWith("6")) cardBrand = "discover";

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          payment_type: 'card',
          card_last4: last4,
          card_expiry_month: formData.expiryMonth,
          card_expiry_year: formData.expiryYear,
          card_brand: cardBrand,
          is_default: formData.isDefault,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to add payment method");
      }

      // Success
      onSuccess();
      onClose();
      setFormData({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardHolder: "",
        isDefault: false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to add payment method");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 max-w-md w-full animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CreditCard size={20} className="text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Add Payment Method</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-ios-gray-700 transition-colors"
          >
            <X size={20} className="text-foreground/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-ios-gray-700 bg-white dark:bg-ios-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-ios-blue"
              required
              maxLength={19}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cardholder Name</label>
            <input
              type="text"
              value={formData.cardHolder}
              onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-ios-gray-700 bg-white dark:bg-ios-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-ios-blue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Expiry Month</label>
              <select
                value={formData.expiryMonth}
                onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-ios-gray-700 bg-white dark:bg-ios-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-ios-blue"
                required
              >
                <option value="">MM</option>
                {months.map((month) => (
                  <option key={month} value={month.toString().padStart(2, '0')}>
                    {month.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Expiry Year</label>
              <select
                value={formData.expiryYear}
                onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-ios-gray-700 bg-white dark:bg-ios-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-ios-blue"
                required
              >
                <option value="">YYYY</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="123"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-ios-gray-700 bg-white dark:bg-ios-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-ios-blue"
              required
              maxLength={4}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-ios-blue focus:ring-ios-blue"
            />
            <label htmlFor="isDefault" className="text-sm text-foreground">
              Set as default payment method
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <Lock size={16} />
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-foreground/40">
            <Lock size={12} />
            Your payment information is secure and encrypted
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-ios-gray-700 text-foreground hover:bg-gray-100 dark:hover:bg-ios-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-ios-blue text-white hover:bg-ios-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Adding..."
              ) : (
                <>
                  <CheckCircle size={18} />
                  Add Payment Method
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}