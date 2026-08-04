"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionStore } from "@/stores/sessionStore";
import { Session } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Calendar, Clock, Users, TrendingUp, Star } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { sessions, loading } = useSessionStore();
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);

  useEffect(() => {
    useSessionStore.getState().loadSessions();
  }, []);

  useEffect(() => {
    setUpcomingSessions(sessions.slice(0, 3));
  }, [sessions]);

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

            <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Upcoming Sessions</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue"></div>
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="card-ios p-6">
                      <h3 className="text-lg font-semibold mb-2 text-foreground">{session.title}</h3>
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
                        {session.averageRating && (
                          <div className="flex items-center gap-2">
                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                            <span>{session.averageRating.toFixed(1)} / 5</span>
                          </div>
                        )}
                      </div>
                    </div>
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
    </ProtectedRoute>
  );
}
