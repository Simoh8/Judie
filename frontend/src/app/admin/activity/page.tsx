"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ActivityDetailsModal, { ActivityLog } from "@/components/ActivityDetailsModal";
import { Activity, Users, Calendar, Clock, Filter, Search, Eye, TrendingUp, AlertCircle } from "lucide-react";

export default function AdminActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [showActivityModal, setShowActivityModal] = useState<ActivityLog | null>(null);

  const isAdmin = user?.isStaff || user?.email === 'admin@actuallydoing.com';

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "session_booking", label: "Session Bookings" },
    { value: "session_cancellation", label: "Session Cancellations" },
    { value: "session_completion", label: "Session Completions" },
    { value: "lead_request", label: "Lead Requests" },
    { value: "lead_request_approved", label: "Lead Approvals" },
    { value: "lead_request_rejected", label: "Lead Rejections" },
    { value: "purchase", label: "Purchases" },
  ];

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = activityFilter === "all" 
        ? '/api/users/all_activities/?limit=100'
        : `/api/users/all_activities/?limit=100&activity_type=${activityFilter}`;

      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.activities || []);
      } else {
        setError('Failed to load activities');
      }
    } catch (error) {
      console.error("Failed to load activities:", error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [activityFilter]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleUserClick = (activity: ActivityLog) => {
    setShowActivityModal(activity);
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.session_title && activity.session_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      'session_booking': 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
      'session_cancellation': 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
      'session_completion': 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
      'lead_request': 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
      'lead_request_approved': 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
      'lead_request_rejected': 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
      'purchase': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
    };
    return colors[type] || 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300';
  };

  const formatActivityType = (type: string) => {
    if (!type) return '';
    return type
      .split('_')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-foreground/60">This page is for administrators only.</p>
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
            <h1 className="text-3xl font-bold text-foreground">Activity Monitoring</h1>
            <p className="text-foreground/60 mt-2">Track all user activities and subscription usage across the platform</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <Activity className="text-blue-600 dark:text-blue-300" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{activities.length}</div>
              <div className="text-sm text-foreground/60">Total Activities</div>
            </div>

            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                  <Users className="text-green-600 dark:text-green-300" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {new Set(activities.map(a => a.user_email)).size}
              </div>
              <div className="text-sm text-foreground/60">Active Users</div>
            </div>

            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                  <Calendar className="text-purple-600 dark:text-purple-300" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {activities.filter(a => a.activity_type.includes('session')).length}
              </div>
              <div className="text-sm text-foreground/60">Session Activities</div>
            </div>

            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                  <TrendingUp className="text-orange-600 dark:text-orange-300" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {activities.filter(a => a.activity_type.includes('lead')).length}
              </div>
              <div className="text-sm text-foreground/60">Lead Activities</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                <input
                  type="text"
                  placeholder="Search activities by user, description, or session..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-foreground placeholder-foreground/40"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {activityTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setActivityFilter(type.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                      activityFilter === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-ios-gray-50 dark:bg-ios-gray-700 text-foreground hover:bg-ios-gray-100 dark:hover:bg-ios-gray-600'
                    }`}
                  >
                    <Filter size={20} />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activities List */}
          {loading ? (
            <div className="text-center py-12 text-foreground/60">Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-ios-gray-800 rounded-2xl">
              <Activity size={48} className="mx-auto text-foreground/40 mb-4" />
              <p className="text-foreground/60">No activities found</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ios-gray-50 dark:bg-ios-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Activity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Session</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Usage</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ios-gray-200 dark:divide-ios-gray-700">
                    {filteredActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-ios-gray-50 dark:hover:bg-ios-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{activity.user_email}</div>
                          {activity.package_name && (
                            <div className="text-xs text-foreground/40">{activity.package_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.activity_type)}`}>
                            {formatActivityType(activity.activity_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">{activity.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          {activity.session_title ? (
                            <div className="text-sm text-foreground">{activity.session_title}</div>
                          ) : (
                            <span className="text-sm text-foreground/40">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {activity.sessions_consumed !== 0 && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                activity.sessions_consumed > 0 
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                                  : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                              }`}>
                                {activity.sessions_consumed > 0 ? '+' : ''}{activity.sessions_consumed} sessions
                              </span>
                            )}
                            {activity.lead_requests_consumed !== 0 && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                activity.lead_requests_consumed > 0 
                                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' 
                                  : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                              }`}>
                                {activity.lead_requests_consumed > 0 ? '+' : ''}{activity.lead_requests_consumed} leads
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-foreground/60">
                            <Clock size={14} />
                            {new Date(activity.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleUserClick(activity)}
                            className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            title="View activity details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <ActivityDetailsModal
          activity={showActivityModal}
          isOpen={!!showActivityModal}
          onClose={() => setShowActivityModal(null)}
        />

        <Footer />
      </div>
    </ProtectedRoute>
  );
}