"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionStore } from "@/stores/sessionStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Calendar, Clock, TrendingUp, Activity, ArrowRight, Crown, Check, X } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { getStats } = useSessionStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leadRequests, setLeadRequests] = useState<any[]>([]);
  const [loadingLeadRequests, setLoadingLeadRequests] = useState(true);

  // Temporary admin check - allow admin@flown.com regardless of isStaff field
  const isAdmin = user?.isStaff || user?.email === 'admin@flown.com';

  const loadStats = useCallback(async () => {
    try {
      const statsData = await getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  }, [getStats]);

  const loadLeadRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/lead-requests?status=pending');
      const data = await response.json();
      if (data.success && data.leadRequests) {
        setLeadRequests(data.leadRequests);
      }
    } catch (error) {
      console.error("Failed to load lead requests:", error);
    } finally {
      setLoadingLeadRequests(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadLeadRequests();
  }, [loadStats, loadLeadRequests]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/lead-requests/${requestId}/approve`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        loadLeadRequests();
      } else {
        alert(data.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/lead-requests/${requestId}/reject`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        loadLeadRequests();
      } else {
        alert(data.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert('Failed to reject request');
    }
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-foreground/60 mt-2">Overview of platform activity and session management</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-foreground/60">Loading dashboard...</div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                      <Calendar className="text-blue-600 dark:text-blue-300" size={24} />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stats?.totalSessions || 0}</div>
                  <div className="text-sm text-foreground/60">Total Sessions</div>
                </div>

                <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                      <Clock className="text-green-600 dark:text-green-300" size={24} />
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                      Scheduled
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stats?.scheduledSessions || 0}</div>
                  <div className="text-sm text-foreground/60">Scheduled Sessions</div>
                </div>

                <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                      <Activity className="text-purple-600 dark:text-purple-300" size={24} />
                    </div>
                    <span className="text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stats?.liveSessions || 0}</div>
                  <div className="text-sm text-foreground/60">Live Sessions</div>
                </div>

                <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                      <Users className="text-orange-600 dark:text-orange-300" size={24} />
                    </div>
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-full">
                      Bookings
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stats?.totalBookings || 0}</div>
                  <div className="text-sm text-foreground/60">Total Bookings</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="/admin/sessions"
                    className="flex items-center justify-between p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl hover:bg-ios-gray-100 dark:hover:bg-ios-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Calendar className="text-blue-600 dark:text-blue-300" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Manage Sessions</div>
                        <div className="text-sm text-foreground/60">Create, edit, and manage sessions</div>
                      </div>
                    </div>
                    <ArrowRight className="text-foreground/40" size={20} />
                  </a>

                  <a
                    href="/admin/users"
                    className="flex items-center justify-between p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl hover:bg-ios-gray-100 dark:hover:bg-ios-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Users className="text-green-600 dark:text-green-300" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Manage Users</div>
                        <div className="text-sm text-foreground/60">View and manage user accounts</div>
                      </div>
                    </div>
                    <ArrowRight className="text-foreground/40" size={20} />
                  </a>
                </div>
              </div>

              {/* Pending Lead Requests */}
              <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Pending Lead Requests</h2>
                  <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-sm font-medium px-3 py-1 rounded-full">
                    {leadRequests.length} pending
                  </span>
                </div>
                {loadingLeadRequests ? (
                  <div className="text-center py-8 text-foreground/60">Loading lead requests...</div>
                ) : leadRequests.length === 0 ? (
                  <div className="text-center py-8 text-foreground/60">No pending lead requests</div>
                ) : (
                  <div className="space-y-4">
                    {leadRequests.map((request) => (
                      <div key={request.id} className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="text-purple-500" size={18} />
                              <span className="font-medium text-foreground">{request.user.firstName} {request.user.lastName}</span>
                              <span className="text-sm text-foreground/60">({request.user.email})</span>
                            </div>
                            <div className="text-sm text-foreground/70 mb-2">
                              wants to lead: <span className="font-medium text-foreground">{request.session.title}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-foreground/60">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(request.session.scheduledFor).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {new Date(request.session.scheduledFor).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Session Status</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground/60">Scheduled</span>
                        <span className="font-medium text-foreground">{stats?.scheduledSessions || 0}</span>
                      </div>
                      <div className="w-full bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stats?.totalSessions ? (stats.scheduledSessions / stats.totalSessions) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground/60">Live</span>
                        <span className="font-medium text-foreground">{stats?.liveSessions || 0}</span>
                      </div>
                      <div className="w-full bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${stats?.totalSessions ? (stats.liveSessions / stats.totalSessions) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground/60">Completed</span>
                        <span className="font-medium text-foreground">{stats?.completedSessions || 0}</span>
                      </div>
                      <div className="w-full bg-ios-gray-200 dark:bg-ios-gray-700 rounded-full h-2">
                        <div
                          className="bg-gray-600 h-2 rounded-full"
                          style={{ width: `${stats?.totalSessions ? (stats.completedSessions / stats.totalSessions) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Platform Health</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="text-green-600" size={20} />
                        <div>
                          <div className="font-medium text-foreground">Session Engagement</div>
                          <div className="text-sm text-foreground/60">Active participation rate</div>
                        </div>
                      </div>
                      <span className="text-green-600 font-semibold">High</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Users className="text-blue-600" size={20} />
                        <div>
                          <div className="font-medium text-foreground">User Growth</div>
                          <div className="text-sm text-foreground/60">New registrations</div>
                        </div>
                      </div>
                      <span className="text-blue-600 font-semibold">Steady</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Clock className="text-purple-600" size={20} />
                        <div>
                          <div className="font-medium text-foreground">Focus Hours</div>
                          <div className="text-sm text-foreground/60">Total productive time</div>
                        </div>
                      </div>
                      <span className="text-purple-600 font-semibold">Growing</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
