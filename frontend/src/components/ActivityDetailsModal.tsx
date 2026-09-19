"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Activity, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  CreditCard, 
  Package, 
  FileText, 
  Check, 
  Copy, 
  Zap, 
  Database, 
  Hash, 
  Info,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  BarChart3
} from "lucide-react";

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  user_email: string;
  activity_type: string;
  description: string;
  created_at: string;
  sessions_consumed: number;
  lead_requests_consumed: number;
  metadata: any;
  session_id?: number | null;
  session_title?: string | null;
  purchase_id?: number | null;
  package_name?: string | null;
  lead_request_id?: number | null;
}

interface ActivityDetailsModalProps {
  activity: ActivityLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityDetailsModal({
  activity,
  isOpen,
  onClose
}: ActivityDetailsModalProps) {
  const [copiedMetadata, setCopiedMetadata] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [userUsage, setUserUsage] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && activity && activity.user_id) {
      fetchUserUsage(activity.user_id);
    } else {
      setUserUsage(null);
    }
  }, [isOpen, activity]);

  const fetchUserUsage = async (userId: number) => {
    try {
      setLoadingUsage(true);
      setUsageError(null);
      const token = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/users/${userId}/usage_summary/`, { headers });
      const data = await response.json();

      if (data.success) {
        setUserUsage(data.usage);
      } else {
        setUsageError("Could not fetch user usage summary");
      }
    } catch (err) {
      console.error("Failed to fetch user usage:", err);
      setUsageError("Failed to load user usage summary");
    } finally {
      setLoadingUsage(false);
    }
  };

  if (!isOpen || !activity) return null;

  const getActivityTypeBadge = (type: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      session_booking: {
        bg: "bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        label: "Session Booking"
      },
      session_cancellation: {
        bg: "bg-rose-500/10 border-rose-500/30 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
        label: "Session Cancellation"
      },
      session_completion: {
        bg: "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        label: "Session Completion"
      },
      lead_request: {
        bg: "bg-purple-500/10 border-purple-500/30 dark:bg-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        label: "Lead Request"
      },
      lead_request_approved: {
        bg: "bg-teal-500/10 border-teal-500/30 dark:bg-teal-500/20",
        text: "text-teal-600 dark:text-teal-400",
        label: "Lead Request Approved"
      },
      lead_request_rejected: {
        bg: "bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        label: "Lead Request Rejected"
      },
      purchase: {
        bg: "bg-indigo-500/10 border-indigo-500/30 dark:bg-indigo-500/20",
        text: "text-indigo-600 dark:text-indigo-400",
        label: "Purchase"
      },
      subscription_renewal: {
        bg: "bg-cyan-500/10 border-cyan-500/30 dark:bg-cyan-500/20",
        text: "text-cyan-600 dark:text-cyan-400",
        label: "Subscription Renewal"
      },
      subscription_expiry: {
        bg: "bg-gray-500/10 border-gray-500/30 dark:bg-gray-500/20",
        text: "text-gray-600 dark:text-gray-400",
        label: "Subscription Expiry"
      },
      login: {
        bg: "bg-sky-500/10 border-sky-500/30 dark:bg-sky-500/20",
        text: "text-sky-600 dark:text-sky-400",
        label: "User Login"
      },
      profile_update: {
        bg: "bg-violet-500/10 border-violet-500/30 dark:bg-violet-500/20",
        text: "text-violet-600 dark:text-violet-400",
        label: "Profile Update"
      }
    };

    const formatFallback = (t: string) =>
      t
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const current = config[type] || {
      bg: "bg-gray-500/10 border-gray-500/30 dark:bg-gray-500/20",
      text: "text-gray-600 dark:text-gray-300",
      label: formatFallback(type)
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.text}`}>
        <Sparkles size={13} />
        {current.label}
      </span>
    );
  };

  const handleCopyMetadata = () => {
    if (activity.metadata) {
      navigator.clipboard.writeText(JSON.stringify(activity.metadata, null, 2));
      setCopiedMetadata(true);
      setTimeout(() => setCopiedMetadata(false), 2000);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(String(activity.id));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const metadataString = activity.metadata && Object.keys(activity.metadata).length > 0
    ? JSON.stringify(activity.metadata, null, 2)
    : null;

  const dateObj = new Date(activity.created_at);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-ios-gray-800 rounded-3xl shadow-2xl dark:shadow-black/60 border border-ios-gray-200 dark:border-ios-gray-700/80 overflow-hidden my-8 transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-ios-gray-50 via-white to-ios-gray-50 dark:from-ios-gray-800 dark:via-ios-gray-700/50 dark:to-ios-gray-800 border-b border-ios-gray-200 dark:border-ios-gray-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Activity size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Activity Log Details</h2>
                  <span className="text-xs font-mono text-foreground/40 bg-ios-gray-100 dark:bg-ios-gray-700 px-2 py-0.5 rounded-md">
                    #{activity.id}
                  </span>
                </div>
                <p className="text-xs text-foreground/60 mt-0.5">
                  Logged on {formattedDate} at {formattedTime}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-foreground/50 hover:text-foreground hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700 rounded-xl transition-colors"
              title="Close modal (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Info Card */}
          <div className="p-5 rounded-2xl bg-ios-gray-50/80 dark:bg-ios-gray-700/40 border border-ios-gray-200/80 dark:border-ios-gray-700/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-1">
                  Activity Type
                </div>
                {getActivityTypeBadge(activity.activity_type)}
              </div>

              {/* Resource Consumption Pills */}
              <div className="flex gap-2">
                {activity.sessions_consumed !== 0 && (
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                    activity.sessions_consumed > 0
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}>
                    <Zap size={14} />
                    {activity.sessions_consumed > 0 ? '+' : ''}{activity.sessions_consumed} Sessions
                  </div>
                )}
                {activity.lead_requests_consumed !== 0 && (
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                    activity.lead_requests_consumed > 0
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}>
                    <Layers size={14} />
                    {activity.lead_requests_consumed > 0 ? '+' : ''}{activity.lead_requests_consumed} Lead Requests
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-1">
                Description
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {activity.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* User Details Grid */}
          <div>
            <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User size={14} /> User Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-ios-gray-700/60 border border-ios-gray-200 dark:border-ios-gray-700 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Mail size={18} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs text-foreground/50 font-medium">User Email</div>
                  <div className="text-sm font-semibold text-foreground truncate">{activity.user_email}</div>
                  {activity.user_name && (
                    <div className="text-xs text-foreground/60 truncate">{activity.user_name}</div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-ios-gray-700/60 border border-ios-gray-200 dark:border-ios-gray-700 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Hash size={18} />
                </div>
                <div>
                  <div className="text-xs text-foreground/50 font-medium">User ID</div>
                  <div className="text-sm font-semibold text-foreground">
                    {activity.user_id ? `#${activity.user_id}` : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Entities (Session, Purchase/Package, Lead Request) */}
          {(activity.session_title || activity.package_name || activity.lead_request_id || activity.session_id || activity.purchase_id) && (
            <div>
              <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers size={14} /> Related Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activity.session_title || activity.session_id) && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-ios-gray-700/60 border border-ios-gray-200 dark:border-ios-gray-700">
                    <div className="flex items-center gap-2 mb-1 text-xs text-foreground/50 font-medium">
                      <Calendar size={14} className="text-blue-500" />
                      Session Information
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {activity.session_title || `Session #${activity.session_id}`}
                    </div>
                    {activity.session_id && (
                      <div className="text-xs text-foreground/40 mt-0.5">ID: {activity.session_id}</div>
                    )}
                  </div>
                )}

                {(activity.package_name || activity.purchase_id) && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-ios-gray-700/60 border border-ios-gray-200 dark:border-ios-gray-700">
                    <div className="flex items-center gap-2 mb-1 text-xs text-foreground/50 font-medium">
                      <Package size={14} className="text-amber-500" />
                      Package & Purchase
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {activity.package_name || `Purchase #${activity.purchase_id}`}
                    </div>
                    {activity.purchase_id && (
                      <div className="text-xs text-foreground/40 mt-0.5">Purchase ID: {activity.purchase_id}</div>
                    )}
                  </div>
                )}

                {activity.lead_request_id && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-ios-gray-700/60 border border-ios-gray-200 dark:border-ios-gray-700">
                    <div className="flex items-center gap-2 mb-1 text-xs text-foreground/50 font-medium">
                      <FileText size={14} className="text-purple-500" />
                      Lead Request
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      Request #{activity.lead_request_id}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Subscription & Usage Live Card */}
          {activity.user_id && (
            <div>
              <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BarChart3 size={14} /> User Subscription & Allowance Status
              </h3>
              <div className="p-4 rounded-2xl bg-white dark:bg-ios-gray-700/60 border border-ios-gray-200 dark:border-ios-gray-700">
                {loadingUsage ? (
                  <div className="text-center py-4 text-xs text-foreground/50 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Fetching current usage summary...
                  </div>
                ) : usageError ? (
                  <div className="text-xs text-rose-500 py-1">{usageError}</div>
                ) : userUsage ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-ios-gray-200 dark:border-ios-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground/60">Subscription:</span>
                        <span className={`font-semibold ${userUsage.has_active_subscription ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {userUsage.has_active_subscription ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {userUsage.package_name && (
                        <div className="font-medium text-foreground bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-xs">
                          {userUsage.package_name}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-500/10">
                        <div className="text-xs text-foreground/50">Sessions Used</div>
                        <div className="text-lg font-bold text-foreground mt-0.5">
                          {userUsage.sessions_used}
                          <span className="text-xs text-foreground/40 font-normal"> / {userUsage.max_sessions === 0 ? "∞" : userUsage.max_sessions}</span>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          {userUsage.sessions_remaining === Infinity ? "Unlimited remaining" : `${userUsage.sessions_remaining} remaining`}
                        </div>
                      </div>

                      <div className="p-3 bg-purple-500/5 dark:bg-purple-500/10 rounded-xl border border-purple-500/10">
                        <div className="text-xs text-foreground/50">Lead Requests Used</div>
                        <div className="text-lg font-bold text-foreground mt-0.5">
                          {userUsage.lead_requests_used}
                          <span className="text-xs text-foreground/40 font-normal"> / {userUsage.max_lead_requests === 0 ? "∞" : userUsage.max_lead_requests}</span>
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                          {userUsage.lead_requests_remaining === Infinity ? "Unlimited remaining" : `${userUsage.lead_requests_remaining} remaining`}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-foreground/40 text-center py-2">No subscription data found</div>
                )}
              </div>
            </div>
          )}

          {/* JSON Metadata Inspector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider flex items-center gap-1.5">
                <Database size={14} /> Metadata Payload
              </h3>
              {metadataString && (
                <button
                  onClick={handleCopyMetadata}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline transition-all"
                >
                  {copiedMetadata ? (
                    <>
                      <Check size={13} className="text-emerald-500" />
                      Copied JSON!
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy JSON
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="relative rounded-2xl bg-ios-gray-900 text-ios-gray-100 p-4 font-mono text-xs overflow-x-auto border border-ios-gray-700/80 shadow-inner">
              {metadataString ? (
                <pre className="text-emerald-400 leading-relaxed overflow-x-auto">
                  {metadataString}
                </pre>
              ) : (
                <div className="text-ios-gray-500 italic py-2 text-center text-xs font-sans">
                  No additional metadata associated with this activity entry.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-ios-gray-50/50 dark:bg-ios-gray-800/80 border-t border-ios-gray-200 dark:border-ios-gray-700/60 flex items-center justify-between">
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700 rounded-xl transition-colors"
          >
            {copiedId ? (
              <>
                <Check size={14} className="text-emerald-500" />
                Copied ID #{activity.id}
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy Activity ID
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
