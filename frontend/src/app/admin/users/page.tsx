"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Search, Shield, Crown, Edit, Save, X, Check, AlertCircle, Mail, Calendar, Clock, Activity, Filter, Eye, BarChart3 } from "lucide-react";

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  focusHours: number | string;
  sessionsJoined: number;
  createdAt: string;
  isStaff: boolean;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "staff" | "regular">("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showActivityModal, setShowActivityModal] = useState<number | null>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState<number | null>(null);
  const [userUsage, setUserUsage] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Temporary admin check
  const isAdmin = user?.isStaff || user?.email === 'admin@actuallydoing.com';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/users/', {
        headers,
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Failed to load users');
        }
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!editingUser) return;

    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        isStaff: userData.isStaff,
      };

      const response = await fetch(`/api/users/${editingUser.id}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('User updated successfully');
        loadUsers();
        setEditingUser(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      setError('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const loadUserActivities = async (userId: number) => {
    try {
      setLoadingActivities(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/users/${userId}/activity_log/?limit=20`, { headers });
      const data = await response.json();
      
      if (data.success) {
        setUserActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to load user activities:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleViewActivity = (userId: number) => {
    setShowActivityModal(userId);
    loadUserActivities(userId);
  };

  const loadUserUsage = async (userId: number) => {
    try {
      setLoadingUsage(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/users/${userId}/usage_summary/`, { headers });
      const data = await response.json();
      
      if (data.success) {
        setUserUsage(data.usage);
      }
    } catch (error) {
      console.error("Failed to load user usage:", error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleViewUsage = (userId: number) => {
    setShowUsageModal(userId);
    loadUserUsage(userId);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      filterRole === "all" ||
      (filterRole === "staff" && user.isStaff) ||
      (filterRole === "regular" && !user.isStaff);
    
    return matchesSearch && matchesRole;
  });

  const staffCount = users.filter(u => u.isStaff).length;
  const regularCount = users.filter(u => !u.isStaff).length;

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
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-foreground/60 mt-2">View and manage user accounts and permissions</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-xl flex items-center gap-2">
              <Check size={20} />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <Users className="text-blue-600 dark:text-blue-300" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{users.length}</div>
              <div className="text-sm text-foreground/60">Total Users</div>
            </div>

            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                  <Shield className="text-purple-600 dark:text-purple-300" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{staffCount}</div>
              <div className="text-sm text-foreground/60">Admin Staff</div>
            </div>

            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                  <Crown className="text-green-600 dark:text-green-300" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{regularCount}</div>
              <div className="text-sm text-foreground/60">Regular Users</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                <input
                  type="text"
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-foreground placeholder-foreground/40"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterRole("all")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                    filterRole === "all"
                      ? 'bg-blue-600 text-white'
                      : 'bg-ios-gray-50 dark:bg-ios-gray-700 text-foreground hover:bg-ios-gray-100 dark:hover:bg-ios-gray-600'
                  }`}
                >
                  <Filter size={20} />
                  All Users
                </button>
                <button
                  onClick={() => setFilterRole("staff")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                    filterRole === "staff"
                      ? 'bg-purple-600 text-white'
                      : 'bg-ios-gray-50 dark:bg-ios-gray-700 text-foreground hover:bg-ios-gray-100 dark:hover:bg-ios-gray-600'
                  }`}
                >
                  <Shield size={20} />
                  Staff Only
                </button>
                <button
                  onClick={() => setFilterRole("regular")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                    filterRole === "regular"
                      ? 'bg-green-600 text-white'
                      : 'bg-ios-gray-50 dark:bg-ios-gray-700 text-foreground hover:bg-ios-gray-100 dark:hover:bg-ios-gray-600'
                  }`}
                >
                  <Users size={20} />
                  Regular Users
                </button>
              </div>
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="text-center py-12 text-foreground/60">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-ios-gray-800 rounded-2xl">
              <Users size={48} className="mx-auto text-foreground/40 mb-4" />
              <p className="text-foreground/60">No users found</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ios-gray-50 dark:bg-ios-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Focus Hours</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Sessions</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Activity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Usage</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ios-gray-200 dark:divide-ios-gray-700">
                    {filteredUsers.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-ios-gray-50 dark:hover:bg-ios-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          {editingUser?.id === userItem.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editingUser.firstName || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                className="w-full px-3 py-2 bg-ios-gray-50 dark:bg-ios-gray-600 rounded-lg text-foreground text-sm"
                                placeholder="First name"
                              />
                              <input
                                type="text"
                                value={editingUser.lastName || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                className="w-full px-3 py-2 bg-ios-gray-50 dark:bg-ios-gray-600 rounded-lg text-foreground text-sm"
                                placeholder="Last name"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium text-foreground">
                                {userItem.firstName} {userItem.lastName}
                              </div>
                              <div className="text-sm text-foreground/60 flex items-center gap-1">
                                <Mail size={14} />
                                {userItem.email}
                              </div>
                              <div className="text-xs text-foreground/40">@{userItem.username}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingUser?.id === userItem.id ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingUser.isStaff}
                                onChange={(e) => setEditingUser({ ...editingUser, isStaff: e.target.checked })}
                                className="w-4 h-4 rounded border-ios-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-foreground">Admin Staff</span>
                            </label>
                          ) : (
                            <div className="flex items-center gap-2">
                              {userItem.isStaff ? (
                                <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-xs font-medium">
                                  <Shield size={14} />
                                  Admin
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                                  <Users size={14} />
                                  User
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-foreground">
                            <Clock size={16} className="text-foreground/40" />
                            <span className="font-medium">{Number(userItem.focusHours).toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-foreground">
                            <Activity size={16} className="text-foreground/40" />
                            <span className="font-medium">{userItem.sessionsJoined}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-foreground/60">
                            <Calendar size={16} />
                            {new Date(userItem.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewActivity(userItem.id)}
                            className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                            title="View activity log"
                          >
                            <BarChart3 size={18} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewUsage(userItem.id)}
                            className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                            title="View usage summary"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {editingUser?.id === userItem.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveUser(editingUser)}
                                disabled={saving}
                                className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors disabled:opacity-50"
                                title="Save"
                              >
                                <Save size={18} />
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="p-2 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingUser(userItem)}
                              className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                              title="Edit user"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Usage Modal */}
          {showUsageModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-ios-gray-800 rounded-2xl max-w-lg w-full">
                <div className="p-6 border-b border-ios-gray-200 dark:border-ios-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Usage Summary</h2>
                    <button
                      onClick={() => setShowUsageModal(null)}
                      className="p-2 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {loadingUsage ? (
                    <div className="text-center py-8 text-foreground/60">Loading usage data...</div>
                  ) : userUsage ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-foreground/60">Subscription Status</span>
                          <span className={`text-sm font-medium ${
                            userUsage.has_active_subscription 
                              ? 'text-green-600 dark:text-green-300' 
                              : 'text-red-600 dark:text-red-300'
                          }`}>
                            {userUsage.has_active_subscription ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {userUsage.package_name && (
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-foreground/60">Package</span>
                            <span className="text-sm font-medium text-foreground">{userUsage.package_name}</span>
                          </div>
                        )}
                        {userUsage.valid_until && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground/60">Valid Until</span>
                            <span className="text-sm font-medium text-foreground">
                              {new Date(userUsage.valid_until).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                          <div className="text-sm text-foreground/60 mb-1">Sessions Used</div>
                          <div className="text-2xl font-bold text-foreground">
                            {userUsage.sessions_used}
                            <span className="text-sm text-foreground/40 font-normal">
                              /{userUsage.max_sessions === 0 ? '∞' : userUsage.max_sessions}
                            </span>
                          </div>
                          <div className="text-xs text-foreground/40 mt-1">
                            {userUsage.sessions_remaining === Infinity 
                              ? 'Unlimited' 
                              : `${userUsage.sessions_remaining} remaining`}
                          </div>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                          <div className="text-sm text-foreground/60 mb-1">Lead Requests Used</div>
                          <div className="text-2xl font-bold text-foreground">
                            {userUsage.lead_requests_used}
                            <span className="text-sm text-foreground/40 font-normal">
                              /{userUsage.max_lead_requests === 0 ? '∞' : userUsage.max_lead_requests}
                            </span>
                          </div>
                          <div className="text-xs text-foreground/40 mt-1">
                            {userUsage.lead_requests_remaining === Infinity 
                              ? 'Unlimited' 
                              : `${userUsage.lead_requests_remaining} remaining`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-foreground/60">No usage data available</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity Modal */}
          {showActivityModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-ios-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-ios-gray-200 dark:border-ios-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">User Activity Log</h2>
                    <button
                      onClick={() => setShowActivityModal(null)}
                      className="p-2 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {loadingActivities ? (
                    <div className="text-center py-8 text-foreground/60">Loading activities...</div>
                  ) : userActivities.length === 0 ? (
                    <div className="text-center py-8 text-foreground/60">No recent activities</div>
                  ) : (
                    <div className="space-y-4">
                      {userActivities.map((activity) => (
                        <div key={activity.id} className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-foreground mb-1">{activity.description}</div>
                              <div className="text-sm text-foreground/60">
                                {new Date(activity.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
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
                          </div>
                          {activity.session_title && (
                            <div className="text-sm text-foreground/70 mt-2">
                              Session: {activity.session_title}
                            </div>
                          )}
                          {activity.package_name && (
                            <div className="text-xs text-foreground/40 mt-1">
                              Package: {activity.package_name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}