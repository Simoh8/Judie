"use client";

import { useState } from "react";
import { X, Star, LogOut } from "lucide-react";

interface LeaveSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onReview?: (session: any) => void;
  sessionTitle: string;
  isOngoing?: boolean;
  session?: any;
}

export default function LeaveSessionDialog({
  isOpen,
  onClose,
  onConfirm,
  onReview,
  sessionTitle,
  isOngoing = false,
  session,
}: LeaveSessionDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLeaveWithoutReview = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to leave session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveWithReview = async () => {
    setLoading(true);
    try {
      // First leave the session
      await onConfirm();
      // Close dialog
      onClose();
      // Then trigger review callback with a delay to allow dialog to close
      if (onReview && session) {
        setTimeout(() => onReview(session), 200);
      }
    } catch (error) {
      console.error("Failed to leave session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 max-w-md w-full animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {isOngoing ? "Leave Session" : "Cancel Booking"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-ios-gray-700 transition-colors"
          >
            <X size={20} className="text-foreground/60" />
          </button>
        </div>

        <p className="text-foreground/70 mb-6">
          Are you sure you want to {isOngoing ? "leave" : "cancel your booking for"} "{sessionTitle}"?
        </p>

        <div className="space-y-3">
          <button
            onClick={handleLeaveWithoutReview}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={18} />
            {loading ? "Leaving..." : isOngoing ? "Leave Session" : "Cancel Booking"}
          </button>

          {onReview && (
            <button
              onClick={handleLeaveWithReview}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 text-foreground hover:bg-gray-100 dark:hover:bg-ios-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Star size={18} className="text-yellow-500" />
              Leave & Review Session
            </button>
          )}

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl text-foreground hover:bg-gray-100 dark:hover:bg-ios-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Session
          </button>
        </div>
      </div>
    </div>
  );
}