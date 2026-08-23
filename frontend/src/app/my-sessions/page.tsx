"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStore } from "@/stores/userStore";
import { useSessionStore } from "@/stores/sessionStore";
import { Session } from "@/lib/types";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ReviewModal from "@/components/ReviewModal";
import { Calendar, Clock, Users, X, Star, Video, Copy, Check } from "lucide-react";

export default function MySessions() {
  const { user } = useAuth();
  const { getUserSessions, updateUser } = useUserStore();
  const { cancelBooking } = useSessionStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [copiedMeetingId, setCopiedMeetingId] = useState<string | null>(null);

  const refreshUserData = useCallback(async () => {
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
  }, [user?.id, updateUser]);

  useEffect(() => {
    async function fetchSessions() {
      if (!user?.id) return;

      try {
        const userSessions = await getUserSessions();
        setSessions(userSessions);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [user?.id, getUserSessions]);

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

  const handleCancelBooking = async (sessionId: string) => {
    if (!user?.id) return;
    
    try {
      // Use session store for consistency
      await cancelBooking(sessionId, user.id);
      
      // Refresh user data and sessions
      await refreshUserData();
      const userSessions = await getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const handleReview = async (rating: number, comment: string) => {
    if (!user?.id || !selectedSession) return;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: selectedSession.id,
          user: user.id,
          rating,
          comment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh sessions to update review status
        const userSessions = await getUserSessions();
        setSessions(userSessions);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const openReviewModal = (session: Session) => {
    setSelectedSession(session);
    setReviewModalOpen(true);
  };

  const copyToClipboard = (text: string, meetingId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMeetingId(meetingId);
    setTimeout(() => setCopiedMeetingId(null), 2000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-ios-gray-900/50">
        <Navbar />
        <main className="pt-24 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 animate-slide-up">
              <h1 className="text-4xl font-bold mb-2 text-foreground">My Sessions</h1>
              <p className="text-foreground/70">Your upcoming and completed focus sessions</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue"></div>
              </div>
            ) : sessions.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                {sessions.map((session) => (
                  <div key={session.id} className="card-ios p-6 relative">
                    {session.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancelBooking(session.id)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
                      >
                        <X size={18} className="text-foreground/60" />
                      </button>
                    )}
                    <h3 className="text-lg font-semibold mb-2 text-foreground pr-8">{session.title}</h3>
                    <div className="space-y-2 text-sm text-foreground/70">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{formatDate(session.scheduledFor)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{formatTime(session.scheduledFor)} • {session.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{session.currentParticipants}/{session.maxParticipants} joined</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : session.status === 'live'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {session.zoomJoinUrl && (
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
                    {session.status === 'completed' ? (
                      <button
                        onClick={() => openReviewModal(session)}
                        className="btn-ios btn-primary text-sm w-full mt-4 flex items-center justify-center gap-2"
                      >
                        <Star size={16} />
                        Review Session
                      </button>
                    ) : session.status === 'scheduled' ? (
                      <button
                        onClick={() => handleCancelBooking(session.id)}
                        className="btn-ios btn-secondary text-sm w-full mt-4"
                      >
                        Cancel Session
                      </button>
                    ) : (
                      <button className="btn-ios btn-primary text-sm w-full mt-4">
                        Join Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-ios p-12 text-center animate-slide-up">
                <p className="text-foreground/60 mb-4">You have not joined any sessions yet</p>
                <button className="btn-ios btn-primary">Browse Sessions</button>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReview}
        sessionTitle={selectedSession?.title || ''}
      />
    </ProtectedRoute>
  );
}
