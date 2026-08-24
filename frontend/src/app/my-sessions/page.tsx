"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStore } from "@/stores/userStore";
import { useSessionStore } from "@/stores/sessionStore";
import { Session } from "@/lib/types";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import SessionCard from "@/components/SessionCard";
import ReviewModal from "@/components/ReviewModal";

export default function MySessions() {
  const { user } = useAuth();
  const { getUserSessions, updateUser } = useUserStore();
  const { cancelBooking, loadUserBookedSessions } = useSessionStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [leadRequestStatuses, setLeadRequestStatuses] = useState<Record<string, string>>({});
  const [loadingLeadRequest, setLoadingLeadRequest] = useState<string | null>(null);

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
        // Load user's booked sessions to update the session store
        await loadUserBookedSessions(user.id);
        const userSessions = await getUserSessions();
        // Set isBooked to true for all user sessions since they are the user's booked sessions
        const sessionsWithBookingStatus = userSessions.map((session: Session) => ({
          ...session,
          isBooked: true
        }));
        setSessions(sessionsWithBookingStatus);

        // Fetch lead request statuses for each session
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
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [user?.id, getUserSessions, loadUserBookedSessions]);

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

  const handleRequestToLead = async (sessionId: string) => {
    if (!user?.id) return;

    setLoadingLeadRequest(sessionId);
    try {
      const response = await fetch('/api/lead-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          user: user.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update the lead request status for this session
        setLeadRequestStatuses(prev => ({
          ...prev,
          [sessionId]: 'pending'
        }));
      }
    } catch (error) {
      console.error("Failed to request to lead:", error);
    } finally {
      setLoadingLeadRequest(null);
    }
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
                  <SessionCard
                    key={session.id}
                    session={session}
                    showCancelButton={true}
                    showZoomDetails={true}
                    showReviewButton={true}
                    onReview={openReviewModal}
                    onRequestToLead={handleRequestToLead}
                    leadRequestStatus={leadRequestStatuses[session.id]}
                    loadingSessionId={loadingLeadRequest}
                    onLoadingChange={(loading, sessionId) => {
                      if (loading) {
                        setLoadingLeadRequest(sessionId);
                      } else {
                        setLoadingLeadRequest(null);
                      }
                    }}
                  />
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
