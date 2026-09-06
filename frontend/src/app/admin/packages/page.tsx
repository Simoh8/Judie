"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plus, Edit, Trash2, DollarSign, Clock, Users, Check, X, ArrowLeft } from "lucide-react";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  maxLeadRequests: number;
  maxSessions: number;
  allowedSessionTypes: string[];
  maxSessionDuration: number;
  supportedRegions: string[];
  is_active: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 'monthly',
    max_lead_requests: '',
    max_sessions: '',
    allowed_session_types: [] as string[],
    max_session_duration: '120',
    supported_regions: [] as string[],
    is_active: true,
    is_featured: false,
    sort_order: '0'
  });

  const SESSION_TYPES = ['sprint', 'deep-work', 'marathon', 'ongoing'];
  const DURATION_OPTIONS = ['monthly', 'quarterly', 'yearly', 'lifetime'];
  const REGION_OPTIONS = ['US', 'UK', 'NG', 'CA', 'AU', 'DE', 'FR', 'IN', 'BR', 'ZA'];

  const isAdmin = user?.isStaff || user?.email === 'admin@flown.com';

  const loadPackages = useCallback(async () => {
    try {
      const response = await fetch('/api/packages');
      const data = await response.json();
      if (data.success && data.packages) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error("Failed to load packages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleCreatePackage = async () => {
    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          max_lead_requests: parseInt(formData.max_lead_requests),
          max_sessions: parseInt(formData.max_sessions),
          max_session_duration: parseInt(formData.max_session_duration),
          sort_order: parseInt(formData.sort_order)
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        loadPackages();
      } else {
        alert(data.error || 'Failed to create package');
      }
    } catch (error) {
      console.error("Failed to create package:", error);
      alert('Failed to create package');
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;
    
    try {
      const response = await fetch(`/api/packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          max_lead_requests: parseInt(formData.max_lead_requests),
          max_sessions: parseInt(formData.max_sessions),
          max_session_duration: parseInt(formData.max_session_duration),
          sort_order: parseInt(formData.sort_order)
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingPackage(null);
        resetForm();
        loadPackages();
      } else {
        alert(data.error || 'Failed to update package');
      }
    } catch (error) {
      console.error("Failed to update package:", error);
      alert('Failed to update package');
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        loadPackages();
      } else {
        alert(data.error || 'Failed to delete package');
      }
    } catch (error) {
      console.error("Failed to delete package:", error);
      alert('Failed to delete package');
    }
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price.toString(),
      duration: pkg.duration,
      max_lead_requests: pkg.maxLeadRequests.toString(),
      max_sessions: pkg.maxSessions.toString(),
      allowed_session_types: pkg.allowedSessionTypes,
      max_session_duration: pkg.maxSessionDuration.toString(),
      supported_regions: pkg.supportedRegions,
      is_active: pkg.is_active,
      is_featured: pkg.isFeatured,
      sort_order: pkg.sortOrder.toString()
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: 'monthly',
      max_lead_requests: '',
      max_sessions: '',
      allowed_session_types: [],
      max_session_duration: '120',
      supported_regions: [],
      is_active: true,
      is_featured: false,
      sort_order: '0'
    });
    setEditingPackage(null);
  };

  const toggleSessionType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      allowed_session_types: prev.allowed_session_types.includes(type)
        ? prev.allowed_session_types.filter(t => t !== type)
        : [...prev.allowed_session_types, type]
    }));
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      supported_regions: prev.supported_regions.includes(region)
        ? prev.supported_regions.filter(r => r !== region)
        : [...prev.supported_regions, region]
    }));
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
            <a href="/admin/dashboard" className="inline-flex items-center text-foreground/60 hover:text-foreground mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Dashboard
            </a>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Package Management</h1>
                <p className="text-foreground/60 mt-2">Create and manage pricing packages</p>
              </div>
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="flex items-center gap-2 btn-ios btn-primary"
              >
                <Plus size={20} />
                Create Package
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-foreground/60">Loading packages...</div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 text-foreground/60">
              No packages found. Create your first package to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{pkg.name}</h3>
                        {pkg.isFeatured && (
                          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 text-xs font-medium px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                        {!pkg.is_active && (
                          <span className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-foreground/60 text-sm mb-4">{pkg.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      ${pkg.price}
                      <span className="text-sm font-normal text-foreground/60">/{pkg.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="text-foreground/40" size={16} />
                      <span className="text-foreground/60">Max Sessions:</span>
                      <span className="font-medium text-foreground">{pkg.maxSessions}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="text-foreground/40" size={16} />
                      <span className="text-foreground/60">Lead Requests:</span>
                      <span className="font-medium text-foreground">{pkg.maxLeadRequests}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-foreground/40" size={16} />
                      <span className="text-foreground/60">Max Duration:</span>
                      <span className="font-medium text-foreground">{pkg.maxSessionDuration} min</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs text-foreground/40 mb-2">Session Types:</div>
                    <div className="flex flex-wrap gap-1">
                      {pkg.allowedSessionTypes.map((type) => (
                        <span key={type} className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs text-foreground/40 mb-2">Regions:</div>
                    <div className="flex flex-wrap gap-1">
                      {pkg.supportedRegions.map((region) => (
                        <span key={region} className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Package Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {editingPackage ? 'Edit Package' : 'Create Package'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); setEditingPackage(null); resetForm(); }}
                    className="p-2 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Package Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                      placeholder="e.g., Basic Plan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                      rows={3}
                      placeholder="Describe the package benefits..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Price (USD)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full p-3 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                        placeholder="29.99"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Duration</label>
                      <select
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full p-3 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                      >
                        {DURATION_OPTIONS.map(option => (
                          <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Max Sessions</label>
                      <input
                        type="number"
                        value={formData.max_sessions}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_sessions: e.target.value }))}
                        className="w-full p-3 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Max Lead Requests</label>
                      <input
                        type="number"
                        value={formData.max_lead_requests}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_lead_requests: e.target.value }))}
                        className="w-full p-3 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Max Session Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.max_session_duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_session_duration: e.target.value }))}
                      className="w-full p-3 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                      placeholder="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Allowed Session Types</label>
                    <div className="flex flex-wrap gap-2">
                      {SESSION_TYPES.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleSessionType(type)}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            formData.allowed_session_types.includes(type)
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                              : 'bg-ios-gray-100 dark:bg-ios-gray-700 text-foreground/60'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Supported Regions</label>
                    <div className="flex flex-wrap gap-2">
                      {REGION_OPTIONS.map(region => (
                        <button
                          key={region}
                          type="button"
                          onClick={() => toggleRegion(region)}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            formData.supported_regions.includes(region)
                              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                              : 'bg-ios-gray-100 dark:bg-ios-gray-700 text-foreground/60'
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
                      <input
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, sort_order: e.target.value }))}
                        className="w-full p-3 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">Featured</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={editingPackage ? handleUpdatePackage : handleCreatePackage}
                      className="flex-1 btn-ios btn-primary"
                    >
                      {editingPackage ? 'Update Package' : 'Create Package'}
                    </button>
                    <button
                      onClick={() => { setShowModal(false); setEditingPackage(null); resetForm(); }}
                      className="flex-1 btn-ios"
                    >
                      Cancel
                    </button>
                  </div>
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