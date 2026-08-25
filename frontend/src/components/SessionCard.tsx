"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionStore } from "@/stores/sessionStore";
import { useUserStore } from "@/stores/userStore";
import { Session } from "@/lib/types";
import { Calendar, Clock, Users, X, Star, Video, Copy, Check, Crown } from "lucide-react";

// Extend Session type with ongoing session properties
interface ExtendedSession extends Session {
  isOngoing?: boolean;
  lastRegeneratedAt?: string | null;
  regenerateIntervalHours?: number;
}

interface SessionCardProps {
  session: ExtendedSession;
  showCancelButton?: boolean;
  showZoomDetails?: boolean;
  showReviewButton?: boolean;
  showCancelInCard?: boolean;
  onReview?: (session: ExtendedSession) => void;
  onRequestToLead?: (sessionId: string) => void;
  leadRequestStatus?: string;
  loadingSessionId?: string | null;
  onLoadingChange?: (loading: boolean, sessionId: string) => void;
  onSessionAction?: () => void;
}

export default function SessionCard({
  session,
  showCancelButton = true,
  showZoomDetails = true,
  showReviewButton = false,
  showCancelInCard = false,
  onReview,
  onRequestToLead,
  leadRequestStatus,
  loadingSessionId: externalLoadingId,
  onLoadingChange,
  onSessionAction,
}: SessionCardProps) {
  const { user } = useAuth();
  const { bookSession, cancelBooking } = useSessionStore();
  const { updateUser } = useUserStore();
  const [internalLoading, setInternalLoading] = useState(false);
  const [copiedMeetingId, setCopiedMeetingId] = useState<string | null>(null);

  const isLoading = externalLoadingId === session.id || internalLoading;
  const isBooked = session.isBooked ?? false;

  const setLoading = (loading: boolean) => {
    setInternalLoading(loading);
    if (onLoadingChange) {
      onLoadingChange(loading, session.id);
    }
  };

  const refreshUserData = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/users/${user.id}/`);
      const data = await response.json();
      if (data.success && data.user) {
        updateUser(data.user);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const handleJoinSession = async () => {
    if (!user?.id || isLoading) return;

    setLoading(true);
    try {
      await bookSession(session.id, user.id);
      await refreshUserData();
      // Force a re-render by updating the session's isBooked property
      (session as any).isBooked = true;
      // Call parent's session action handler to refresh dashboard data
      if (onSessionAction) {
        await onSessionAction();
      }
    } catch (error) {
      console.error("Failed to join session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!user?.id || isLoading) return;

    setLoading(true);
    try {
      await cancelBooking(session.id, user.id);
      await refreshUserData();
      // Call parent's session action handler to refresh dashboard data
      if (onSessionAction) {
        await onSessionAction();
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const extendedSession = session as ExtendedSession;
  const isOngoingSession = session.type === 'ongoing' || extendedSession.isOngoing;

  const copyToClipboard = (text: string, meetingId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMeetingId(meetingId);
    setTimeout(() => setCopiedMeetingId(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "live": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="card-ios p-6 relative">
      {showCancelButton && isBooked && session.status === 'scheduled' && (
        <button
          onClick={handleCancelBooking}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
          disabled={isLoading}
          title="Cancel booking"
        >
          <X size={18} className="text-foreground/60" />
        </button>
      )}
      
      <h3 className="text-lg font-semibold mb-2 text-foreground pr-8">{session.title}</h3>
      
      <div className="space-y-2 text-sm text-foreground/70">
        {isOngoingSession ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Video size={16} />
            <span className="font-medium">Always Available</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(session.scheduledFor)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{formatTime(session.scheduledFor)} • {session.duration} min</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>{session.currentParticipants}/{session.maxParticipants} joined</span>
        </div>
        {session.averageRating && (
          <div className="flex items-center gap-2">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span>{session.averageRating.toFixed(1)} / 5</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>
        {isOngoingSession && extendedSession.regenerateIntervalHours && (
          <div className="flex items-center gap-2 text-xs text-foreground/60">
            <Clock size={12} />
            <span>Regenerates every {extendedSession.regenerateIntervalHours}h</span>
          </div>
        )}
      </div>

      {showZoomDetails && session.zoomJoinUrl && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
            <Video size={16} />
            <span>Zoom Meeting</span>
          </div>
          <div className="space-y-1 text-xs text-foreground/70">
            <div className="flex items-center justify-between">
              <span>Meeting ID: {session.zoomMeetingId}</span>
              <button
                onClick={() => copyToClipboard(session.zoomMeetingId || '', session.zoomMeetingId || '')}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
              >
                {copiedMeetingId === session.zoomMeetingId ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <div>Password: {session.zoomPassword}</div>
            <a
              href={session.zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Join Meeting →
            </a>
          </div>
        </div>
      )}

      {isBooked ? (
        <div className="space-y-2 mt-4">
          {showCancelButton && session.status === 'scheduled' && (
            <button
              onClick={handleCancelBooking}
              className="btn-ios btn-secondary text-sm w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Cancel Session'}
            </button>
          )}
          
          {session.leader?.id === user?.id ? (
            <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
              <Crown size={16} />
              <span>You are leading this session</span>
            </div>
          ) : leadRequestStatus === 'pending' ? (
            <div className="text-center text-sm text-foreground/60">
              Request pending...
            </div>
          ) : leadRequestStatus === 'approved' ? (
            <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
              <Crown size={16} />
              <span>Request approved!</span>
            </div>
          ) : leadRequestStatus === 'rejected' ? (
            <div className="text-center text-sm text-red-500">
              Request rejected
            </div>
          ) : onRequestToLead && session.status === 'scheduled' ? (
            <button
              onClick={() => onRequestToLead(session.id)}
              className="btn-ios btn-primary text-sm w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Requesting...' : 'Request to Lead'}
            </button>
          ) : null}
        </div>
      ) : (
        <button
          onClick={handleJoinSession}
          className="btn-ios btn-primary text-sm w-full mt-4"
          disabled={session.currentParticipants >= session.maxParticipants || isLoading}
        >
          {isLoading ? 'Joining...' : session.currentParticipants >= session.maxParticipants ? 'Session Full' : 'Join Session'}
        </button>
      )}

      {showReviewButton && session.status === 'completed' && onReview && (
        <button
          onClick={() => onReview(session)}
          className="btn-ios btn-primary text-sm w-full mt-4 flex items-center justify-center gap-2"
        >
          <Star size={16} />
          Review Session
        </button>
      )}
    </div>
  );
}