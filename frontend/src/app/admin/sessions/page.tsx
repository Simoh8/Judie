"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionStore } from "@/stores/sessionStore";
import { Session } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import SessionForm from "@/components/SessionForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plus, Search, Filter, Play, Square, Users, Calendar, Clock, Trash2, Edit, Eye, Video, RefreshCw, RotateCcw, X } from "lucide-react";

// Extend Session type with ongoing session properties
interface ExtendedSession extends Session {
  isOngoing?: boolean;
  lastRegeneratedAt?: string | null;
  regenerateIntervalHours?: number;
}

export default function AdminSessionsPage() {
  const { user } = useAuth();
  const {
    sessions,
    loading,
    searchTerm,
    statusFilter,
    typeFilter,
    setSearchTerm,
    setStatusFilter,
    setTypeFilter,
    createSession,
    updateSession,
    deleteSession,
    startSession,
    endSession,
    regenerateZoom,
    getParticipants,
    getStats,
  } = useSessionStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ExtendedSession | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<ExtendedSession | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  const isAdmin = user?.isStaff;

  const loadStats = useCallback(async () => {
    const statsData = await getStats();
    setStats(statsData);
  }, [getStats]);

  useEffect(() => {
    loadStats();
    // Initial load of sessions
    useSessionStore.getState().loadSessions();
  }, [loadStats]);

  const handleCreateSession = async (sessionData: any) => {
    try {
      await createSession(sessionData);
      loadStats();
    } catch (error) {
      console.error("Create session error:", error);
      throw error;
    }
  };

  const handleEditSession = async (sessionData: any) => {
    if (!editingSession) return;
    try {
      await updateSession(editingSession.id.toString(), sessionData);
      setEditingSession(null);
    } catch (error) {
      console.error("Update session error:", error);
      throw error;
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await deleteSession(sessionId);
      loadStats();
    } catch (error) {
      console.error("Delete session error:", error);
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await startSession(sessionId);
      loadStats();
    } catch (error) {
      console.error("Start session error:", error);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endSession(sessionId);
      loadStats();
    } catch (error) {
      console.error("End session error:", error);
    }
  };

  const handleRegenerateZoom = async (sessionId: string) => {
    try {
      await regenerateZoom(sessionId);
    } catch (error) {
      console.error("Regenerate Zoom error:", error);
    }
  };

  const handleViewParticipants = async (session: ExtendedSession) => {
    try {
      const participantsData = await getParticipants(session.id.toString());
      setParticipants(participantsData);
      setSelectedSession(session);
      setShowParticipants(true);
    } catch (error) {
      console.error("Load participants error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "live": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sprint": return "Focus Sprint";
      case "deep-work": return "Deep Work";
      case "marathon": return "Marathon";
      case "ongoing": return "Ongoing Call";
      default: return type;
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-foreground/60">This page is for administrators only.</p>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
              className="mt-4 btn-ios btn-primary"
            >
              Logout and Login Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-ios-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Session Management</h1>
              <p className="text-foreground/60 mt-2">Create and manage focus sessions</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-ios btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Create Session
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="text-foreground/60 text-sm mb-2">Total Sessions</div>
                <div className="text-3xl font-bold text-foreground">{stats.totalSessions ?? 0}</div>
              </div>
              <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="text-foreground/60 text-sm mb-2">Scheduled</div>
                <div className="text-3xl font-bold text-blue-600">{stats.scheduledSessions ?? 0}</div>
              </div>
              <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="text-foreground/60 text-sm mb-2">Live</div>
                <div className="text-3xl font-bold text-green-600">{stats.liveSessions ?? 0}</div>
              </div>
              <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="text-foreground/60 text-sm mb-2">Total Bookings</div>
                <div className="text-3xl font-bold text-foreground">{stats.totalBookings ?? 0}</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                >
                  <option value="">All Types</option>
                  <option value="sprint">Focus Sprint</option>
                  <option value="deep-work">Deep Work</option>
                  <option value="marathon">Marathon</option>
                  <option value="ongoing">Ongoing Call</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="bg-white dark:bg-ios-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-foreground/60">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-foreground/60">No sessions found</div>
            ) : (
              <div className="divide-y divide-ios-gray-200 dark:divide-ios-gray-700">
                {sessions.map((session) => {
                  const extendedSession = session as ExtendedSession;
                  return (
                  <div key={session.id} className="p-6 hover:bg-gray-50 dark:hover:bg-ios-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{extendedSession.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(extendedSession.status)}`}>
                            {extendedSession.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-ios-gray-100 text-ios-gray-700 dark:bg-ios-gray-700 dark:text-ios-gray-300">
                            {getTypeLabel(extendedSession.type)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                          {extendedSession.isOngoing ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <Video size={16} />
                              <span className="font-medium">Always Available</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              {formatDate(extendedSession.scheduledFor)}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            {extendedSession.duration} minutes
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            {extendedSession.currentParticipants}/{extendedSession.maxParticipants}
                          </div>
                          <div>Facilitator: {extendedSession.facilitator}</div>
                          {extendedSession.isOngoing && extendedSession.lastRegeneratedAt && (
                            <div className="flex items-center gap-2 text-xs text-foreground/60">
                              <RefreshCw size={12} />
                              <span>Last regenerated: {formatDate(extendedSession.lastRegeneratedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewParticipants(extendedSession)}
                          className="p-2 rounded-lg hover:bg-ios-gray-100 dark:hover:bg-ios-gray-600 transition-colors"
                          title="View Participants"
                        >
                          <Eye size={18} className="text-foreground/60" />
                        </button>
                        {extendedSession.isOngoing && (
                          <button
                            onClick={() => handleRegenerateZoom(extendedSession.id.toString())}
                            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                            title="Regenerate Zoom Meeting"
                          >
                            <RotateCcw size={18} className="text-blue-600" />
                          </button>
                        )}
                        {extendedSession.status === "scheduled" && (
                          <button
                            onClick={() => handleStartSession(extendedSession.id.toString())}
                            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                            title="Start Session"
                          >
                            <Play size={18} className="text-green-600" />
                          </button>
                        )}
                        {extendedSession.status === "live" && (
                          <button
                            onClick={() => handleEndSession(extendedSession.id.toString())}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                            title="End Session"
                          >
                            <Square size={18} className="text-red-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingSession(extendedSession);
                            setIsFormOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          title="Edit Session"
                        >
                          <Edit size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(extendedSession.id.toString())}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </div>

          {/* Participants Modal */}
          {showParticipants && selectedSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowParticipants(false)} />
              <div className="relative bg-white dark:bg-ios-gray-900 rounded-3xl p-8 w-full max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowParticipants(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
                >
                  <X size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Participants - {selectedSession.title}
                </h2>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 bg-ios-gray-50 dark:bg-ios-gray-800 rounded-xl">
                      <div>
                        <div className="font-medium text-foreground">
                          {participant.firstName} {participant.lastName}
                        </div>
                        <div className="text-sm text-foreground/60">{participant.email}</div>
                      </div>
                      <div className="text-sm text-foreground/60">
                        Booked: {new Date(participant.bookedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center text-foreground/60">
                  Total: {participants.length} participants
                </div>
              </div>
            </div>
          )}

          {/* Session Form Modal */}
          <SessionForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingSession(null);
            }}
            onSubmit={editingSession ? handleEditSession : handleCreateSession}
            initialData={editingSession}
          />
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
