"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Timer, Coffee, Zap, Calendar, Clock, Users } from "lucide-react";
import { Session } from "@/lib/types";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import AuthModal from "./AuthModal";

const sessionTypeConfig = {
  sprint: {
    icon: Timer,
    color: "from-blue-500 to-cyan-500",
    label: "Focus Sprint",
  },
  "deep-work": {
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    label: "Deep Work",
  },
  marathon: {
    icon: Coffee,
    color: "from-orange-500 to-red-500",
    label: "Marathon",
  },
  ongoing: {
    icon: Users,
    color: "from-green-500 to-emerald-500",
    label: "Ongoing Call",
  },
};

export default function SessionTypes() {
  const { sessions, loading, loadUserBookedSessions } = useSessionStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    useSessionStore.getState().loadSessions();
    if (user?.id) {
      loadUserBookedSessions(user.id);
    }
  }, [user?.id, loadUserBookedSessions]);

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

  const handleBookSession = async (sessionId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setBookingSessionId(sessionId);
    try {
      // Use session store for consistency
      await useSessionStore.getState().bookSession(sessionId, user.id);
      router.push("/my-sessions");
    } catch (error) {
      console.error("Failed to book session:", error);
    } finally {
      setBookingSessionId(null);
    }
  };

  if (loading) {
    return (
      <section id="sessions" className="py-24 px-6 bg-gray-50 dark:bg-ios-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4 mx-auto w-64"></div>
              <div className="h-6 bg-gray-200 rounded mb-16 mx-auto w-96"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="sessions" className="py-24 px-6 bg-gray-50 dark:bg-ios-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Upcoming Sessions
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Join a live focus session and work alongside others
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sessions.map((session, index) => {
              const config = sessionTypeConfig[session.type] || sessionTypeConfig.sprint;
              const Icon = config.icon;
              const isBooking = bookingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  className="relative animate-slide-up group"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="card-ios h-full overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`bg-gradient-to-br ${config.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground/60">
                        {config.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {session.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Calendar size={16} />
                        <span>{formatDate(session.scheduledFor)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Clock size={16} />
                        <span>{formatTime(session.scheduledFor)} • {session.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Users size={16} />
                        <span>{session.currentParticipants}/{session.maxParticipants} joined</span>
                      </div>
                    </div>

                    <p className="text-foreground/70 text-sm leading-relaxed mb-4">
                      {session.description}
                    </p>

                    {session.isBooked ?? false ? (
                      <button
                        disabled
                        className="btn-ios btn-secondary text-sm w-full opacity-50"
                      >
                        Already Joined
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBookSession(session.id)}
                        disabled={isBooking}
                        className="btn-ios btn-primary text-sm w-full disabled:opacity-50"
                      >
                        {isBooking ? "Booking..." : "Join Session"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-foreground/60">No upcoming sessions scheduled</p>
            </div>
          )}

          <div className="mt-12 text-center animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <button className="btn-ios btn-secondary text-lg">
              View full schedule
            </button>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
