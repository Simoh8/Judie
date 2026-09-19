"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, CheckCircle } from "lucide-react";
import { useUserStore } from "@/stores/userStore";

interface UpdateBillingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function UpdateBillingInfoModal({ isOpen, onClose, onSuccess, user }: UpdateBillingInfoModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { updateUser } = useUserStore();

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Invalid email address");
      }

      // Validate name
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error("First name and last name are required");
      }

      // Update user profile using the userStore
      await updateUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Success
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update billing information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 max-w-md w-full animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <User size={20} className="text-purple-600 dark:text-purple-300" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Update Billing Information</h2>
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
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-ios-gray-700 bg-white dark:bg-ios-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-ios-blue"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-ios-gray-700 bg-white dark:bg-ios-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-ios-blue"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-ios-gray-700 bg-white dark:bg-ios-gray-900 text-foreground focus:outline-none focus:ring-2 focus:ring-ios-blue"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <X size={16} />
              {error}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Updating your email address will change your login email for all services.
            </p>
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
                "Updating..."
              ) : (
                <>
                  <CheckCircle size={18} />
                  Update Information
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}