"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionStore } from "@/stores/sessionStore";
import { useUserStore } from "@/stores/userStore";
import { Session } from "@/lib/types";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import SessionCard from "@/components/SessionCard";
import ReviewModal from "@/components/ReviewModal";
import { Clock, Users, Calendar, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { sessions, loading, loadUserBookedSessions } = useSessionStore();
  const { updateUser, getUserSessions, setUser } = useUserStore();
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [bookedSessions, setBookedSessions] = useState<Session[]>([]);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [leadRequestStatuses, setLeadRequestStatuses] = useState<Record<string, string>>({});
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    if (user?.id) {
      // loadUserBookedSessions already calls loadSessions internally
      loadUserBookedSessions(user.id);
    } else {
      // If no user, just load sessions without booking status
      useSessionStore.getState().loadSessions();
    }
  }, [user?.id, loadUserBookedSessions]);

  useEffect(() => {
    setUpcomingSessions(sessions.slice(0, 3));
  }, [sessions]);

  useEffect(() => {
    async function fetchBookedSessions() {
      if (!user?.id) return;

      try {
        await loadUserBookedSessions(user.id);
        const userSessions = await getUserSessions();
        const sessionsWithBookingStatus = userSessions.map((session: Session) => ({
          ...session,
          isBooked: true
        }));
        setBookedSessions(sessionsWithBookingStatus);

        const statuses: Record<string, string> = {};
        for (const session of sessionsWithBookingStatus) {
          try {
            const response = await fetch(`/api/lead-requests?user=${user.id}&session=${session.id}`);
            const data = await response.json();
            if (data.success && data.leadRequests && data.leadRequests.length > 0) {
              statuses[session.id] = data.leadRequests[0].status;
            }
          } catch (error) {
            console.error(`Failed to fetch lead request for session ${session.id}:`, error);
          }
        }
        setLeadRequestStatuses(statuses);
      } catch (error) {
        console.error("Failed to fetch booked sessions:", error);
      }
    }

    fetchBookedSessions();
  }, [user?.id, loadUserBookedSessions, getUserSessions]);

  const refreshUserData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await api.getUser(user.id.toString());
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }, [user?.id, setUser]);

  const refreshLeadRequests = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/lead-requests/?user=${user.id}`);
      const data = await response.json();
      if (data.success && data.leadRequests) {
        const statuses: Record<string, string> = {};
        data.leadRequests.forEach((req: any) => {
          statuses[String(req.session.id)] = req.status;
        });
        setLeadRequestStatuses(statuses);
      }
    } catch (error) {
      console.error("Failed to fetch lead requests:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshUserData();
    refreshLeadRequests();
  }, [refreshUserData, refreshLeadRequests]);

  const handleRequestToLead = async (sessionId: string) => {
    if (!user?.id || loadingSessionId) return;

    setLoadingSessionId(sessionId);
    try {
      const response = await fetch('/api/lead-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: sessionId, user: user.id }),
      });

      const data = await response.json();
      if (data.success) {
        // Update lead request status
        setLeadRequestStatuses(prev => ({ ...prev, [sessionId]: 'pending' }));
        // Refresh user data, lead requests, sessions, and booked sessions
        const promises = [
          refreshUserData(),
          refreshLeadRequests(),
          useSessionStore.getState().loadSessions(true),
        ];
        if (user?.id) {
          promises.push(loadUserBookedSessions(user.id));
        }
        await Promise.all(promises);
      } else {
        alert(data.error || 'Failed to request to lead');
      }
    } catch (error) {
      console.error("Failed to request to lead:", error);
      alert('Failed to request to lead');
    } finally {
      setLoadingSessionId(null);
    }
  };
  
  const handleSessionAction = async () => {
    // Refresh all data when a session action occurs (join/cancel)
    const promises = [
      refreshUserData(),
      refreshLeadRequests(),
      useSessionStore.getState().loadSessions(true),
    ];
    if (user?.id) {
      promises.push(loadUserBookedSessions(user.id));
    }
    await Promise.all(promises);
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
        const userSessions = await getUserSessions();
        setBookedSessions(userSessions);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const openReviewModal = (session: Session) => {
    setSelectedSession(session);
    setReviewModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-ios-gray-900/50">
        <Navbar />
        <main className="pt-24 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 animate-slide-up">
              <h1 className="text-4xl font-bold mb-2 text-foreground">
                Welcome back, {user?.firstName || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-foreground/70">Ready to get into flow?</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Clock size={20} className="text-ios-blue" />
                  </div>
                  <span className="text-sm text-foreground/60">Focus Hours</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{user?.focusHours || 0}</p>
              </div>

              <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                    <Users size={20} className="text-purple-500" />
                  </div>
                  <span className="text-sm text-foreground/60">Sessions Joined</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{user?.sessionsJoined || 0}</p>
              </div>

              <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <Calendar size={20} className="text-green-500" />
                  </div>
                  <span className="text-sm text-foreground/60">Upcoming</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{upcomingSessions.length}</p>
              </div>

              <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                    <TrendingUp size={20} className="text-orange-500" />
                  </div>
                  <span className="text-sm text-foreground/60">Streak</span>
                </div>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>

            {bookedSessions.length > 0 && (
              <div className="animate-slide-up mb-8" style={{ animationDelay: "0.5s" }}>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Your Sessions</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookedSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      showCancelButton={true}
                      showZoomDetails={true}
                      showReviewButton={true}
                      onReview={openReviewModal}
                      onRequestToLead={handleRequestToLead}
                      onSessionAction={handleSessionAction}
                      leadRequestStatus={leadRequestStatuses[session.id]}
                      loadingSessionId={loadingSessionId}
                      onLoadingChange={(loading, sessionId) => {
                        if (loading) {
                          setLoadingSessionId(sessionId);
                        } else {
                          setLoadingSessionId(null);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Upcoming Sessions</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue"></div>
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      showCancelButton={true}
                      showZoomDetails={false}
                      onRequestToLead={handleRequestToLead}
                      leadRequestStatus={leadRequestStatuses[String(session.id)]}
                      loadingSessionId={loadingSessionId}
                      onLoadingChange={(loading, sessionId) => {
                        if (loading) {
                          setLoadingSessionId(sessionId);
                        } else {
                          setLoadingSessionId(null);
                        }
                      }}
                      onSessionAction={handleSessionAction}
                    />
                  ))}
                </div>
              ) : (
                <div className="card-ios p-12 text-center">
                  <p className="text-foreground/60">No upcoming sessions</p>
                  <button className="btn-ios btn-primary mt-4">Browse Sessions</button>
                </div>
              )}
            </div>
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
