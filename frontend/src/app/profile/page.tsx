"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStore } from "@/stores/userStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { User, Mail, Calendar, Clock, Users, Save } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { updateUser } = useUserStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      await updateUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setEditing(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-ios-gray-900/50">
        <Navbar />
        <main className="pt-24 px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 animate-slide-up">
              <h1 className="text-4xl font-bold mb-2 text-foreground">Profile</h1>
              <p className="text-foreground/70">Manage your account settings</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="md:col-span-1">
                <div className="card-ios p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-ios-blue to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-foreground/60 text-sm">{user?.email}</p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="card-ios p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="btn-ios btn-secondary text-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancel}
                          className="btn-ios btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="btn-ios btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save size={16} />
                          {loading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground/70">First Name</label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                        />
                      ) : (
                        <p className="text-foreground">{user?.firstName || "Not set"}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground/70">Last Name</label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                        />
                      ) : (
                        <p className="text-foreground">{user?.lastName || "Not set"}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground/70">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-foreground/40" />
                        <p className="text-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-ios p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock size={18} className="text-ios-blue" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{user?.focusHours || 0}</p>
                      <p className="text-sm text-foreground/60">Focus Hours</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users size={18} className="text-purple-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{user?.sessionsJoined || 0}</p>
                      <p className="text-sm text-foreground/60">Sessions</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar size={18} className="text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">0</p>
                      <p className="text-sm text-foreground/60">Streak</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
