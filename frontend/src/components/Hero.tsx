"use client";

import Link from "next/link";
import { ArrowRight, Play, Timer, Coffee, Zap, Users, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionStore } from "@/stores/sessionStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function Hero() {
  const { user, loading } = useAuth();
  const { sessions, loading: sessionsLoading, loadSessions, bookSession } = useSessionStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const router = useRouter();

  // Typing effect for description
  useEffect(() => {
    const description = "Work silently alongside others in virtual body doubling sessions that boost focus and accountability. Especially effective for those with ADHD.";
    let index = 0;
    
    const typeNextChar = () => {
      if (index < description.length) {
        setTypedText(description.slice(0, index + 1));
        index++;
        setTimeout(typeNextChar, 30 + Math.random() * 20); // Random typing speed for natural effect
      } else {
        setIsTyping(false);
      }
    };

    // Start typing after a small delay
    const startDelay = setTimeout(() => {
      typeNextChar();
    }, 500);

    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

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
      await bookSession(sessionId, user.id);
      router.push("/my-sessions");
    } catch (error) {
      console.error("Failed to book session:", error);
    } finally {
      setBookingSessionId(null);
    }
  };

  return (
    <section className="min-h-screen flex items-center pt-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-ios-gray-900 dark:via-black dark:to-ios-gray-800 -z-10 animate-gradient-shift" />

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="animate-slide-up">
            <span className="inline-block px-4 py-2 rounded-full bg-ios-blue/10 text-ios-blue text-sm font-medium mb-6 transition-all duration-300 hover:bg-ios-blue/20 hover:scale-105 cursor-default">
              {!loading && user ? `Welcome back, ${user.firstName || user.email?.split('@')[0]} 👋` : "Neuroscience-backed focus"}
            </span>

            {!loading && user ? (
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground animate-fade-in">
                Welcome back,
                <br />
                <span className="text-ios-blue">{user.firstName || user.email?.split('@')[0]}</span>.
              </h1>
            ) : (
              <h1 className="font-sf-pro tracking-tight leading-[1.05]">
                {/* Primary - Body Doubling */}
                <span className="block text-[clamp(2.5rem,8vw,4.5rem)] font-semibold bg-gradient-to-b from-[#1c1c1e] to-[#3a3a3c] bg-clip-text text-transparent dark:from-[#f5f5f7] dark:to-[#86868b] animate-text-glow">
                  Body Doubling
                </span>

                {/* Subhead - Less distraction. */}
                <span className="block mt-1 text-[clamp(1.5rem,4vw,2.5rem)] font-light text-[#86868b] tracking-[0.02em]">
                  Less distraction.
                </span>

                {/* Hero - More feel-good focus. - iPhone-style pill */}
                <span className="block mt-2">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007aff]/10 border border-[#007aff]/20 backdrop-blur-sm">
                    <span className="text-[clamp(1.5rem,4vw,2.5rem)] font-medium text-[#007aff] tracking-tight">
                      More
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#007aff]/30" />
                    <span className="text-[clamp(1.5rem,4vw,2.5rem)] font-medium text-[#007aff] tracking-tight">
                      feel-good
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#007aff]/30" />
                    <span className="text-[clamp(1.5rem,4vw,2.5rem)] font-medium text-[#007aff] tracking-tight">
                      focus.
                    </span>
                  </span>
                </span>
              </h1>
            )}

            {!loading && user ? (
              <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-2xl leading-relaxed animate-fade-in">
                Ready for another productive co-working session? Connect with your virtual body doubling partners and hit your goals today.
              </p>
            ) : (
              <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-2xl leading-relaxed min-h-[80px]">
                {typedText}
                <span className={`inline-block w-0.5 h-6 bg-ios-blue ml-1 ${isTyping ? 'animate-pulse' : 'opacity-0'}`}></span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 h-[60px]">
              {loading ? (
                <>
                  <div className="w-52 h-[60px] bg-foreground/5 animate-pulse rounded-2xl" />
                  <div className="w-40 h-[60px] bg-foreground/5 animate-pulse rounded-2xl" />
                </>
              ) : user ? (
                <>
                  <Link href="/dashboard" className="btn-ios btn-primary text-lg px-8 py-4 flex items-center gap-2 animate-pulse-glow">
                    Go to Dashboard
                    <ArrowRight size={20} />
                  </Link>
                  <Link href="/my-sessions" className="btn-ios btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                    My Sessions
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/pricing" className="btn-ios btn-primary text-lg px-8 py-4 flex items-center gap-2 animate-pulse-glow">
                    Start your free trial
                    <ArrowRight size={20} />
                  </Link>
                  <Link href="/how-it-works" className="btn-ios btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                    How it works
                    <ArrowRight size={20} />
                  </Link>
                </>
              )}
            </div>

            <div className="relative animate-scale-in" style={{ animationDelay: "0.3s" }}>
              <div className="card-ios ios-shadow-lg p-6 md:p-8 bg-gradient-to-br from-white to-gray-50 dark:from-ios-gray-800 dark:to-ios-gray-900">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-ios-blue mb-2">50k+</div>
                    <div className="text-xs md:text-sm text-foreground/60">Active members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-ios-green mb-2">2M+</div>
                    <div className="text-xs md:text-sm text-foreground/60">Focus hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-ios-orange mb-2">4.9★</div>
                    <div className="text-xs md:text-sm text-foreground/60">App rating</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -left-4 w-24 h-24 bg-ios-blue/20 rounded-full blur-3xl animate-float" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-ios-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
            </div>
          </div>

          {/* Right Column - Upcoming Sessions */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="card-ios ios-shadow-lg p-6 bg-gradient-to-br from-white to-gray-50 dark:from-ios-gray-800 dark:to-ios-gray-900 max-h-[600px] overflow-y-auto animate-pulse-glow">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-foreground">Upcoming Sessions</h2>
                <p className="text-sm text-foreground/70">Join a live focus session</p>
              </div>

              {sessionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-foreground/10 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-foreground/5 rounded mb-2 w-1/2"></div>
                      <div className="h-10 bg-foreground/5 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.slice(0, 3).map((session, index) => {
                    const config = sessionTypeConfig[session.type] || sessionTypeConfig.sprint;
                    const Icon = config.icon;
                    const isBooking = bookingSessionId === session.id;

                    return (
                      <div
                        key={session.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="border border-foreground/10 rounded-xl p-4 hover:border-ios-blue/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-blue-50 dark:hover:from-ios-gray-800 dark:hover:to-ios-gray-700">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`bg-gradient-to-br ${config.color} w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300`}>
                              <Icon size={16} className="text-white" />
                            </div>
                            <span className="text-xs font-medium text-foreground/60">
                              {config.label}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold mb-2 text-foreground">
                            {session.title}
                          </h3>

                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2 text-xs text-foreground/70">
                              <Calendar size={14} />
                              <span>{formatDate(session.scheduledFor)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-foreground/70">
                              <Clock size={14} />
                              <span>{formatTime(session.scheduledFor)} • {session.duration} min</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-foreground/70">
                              <Users size={14} />
                              <span>{session.currentParticipants}/{session.maxParticipants} joined</span>
                            </div>
                          </div>

                          {session.isBooked ?? false ? (
                            <button
                              disabled
                              className="btn-ios btn-secondary text-xs w-full opacity-50"
                            >
                              Already Joined
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBookSession(session.id)}
                              disabled={isBooking}
                              className="btn-ios btn-primary text-xs w-full disabled:opacity-50"
                            >
                              {isBooking ? "Booking..." : "Join Session"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {sessions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-foreground/60 text-sm">No upcoming sessions scheduled</p>
                    </div>
                  )}

                  {sessions.length > 0 && (
                    <div className="pt-4">
                      <Link href="/sessions" className="btn-ios btn-secondary text-sm w-full">
                        View all sessions
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </section>
  );
}
