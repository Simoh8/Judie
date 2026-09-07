"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Settings, Save, Eye, EyeOff, Plus, Trash2, Lock, Unlock, Globe, Server, Layout, Check, X, AlertCircle, FileText, RefreshCw, Upload, Image as ImageIcon } from "lucide-react";

interface Setting {
  id: number;
  key: string;
  value: string;
  decryptedValue?: string;
  category: string;
  categoryDisplay: string;
  setting_type: string;
  typeDisplay: string;
  description: string;
  is_encrypted: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface EnvironmentVariable {
  key: string;
  value: string;
  comment?: string;
  isSensitive: boolean;
  isComment: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const categories: Category[] = [
  { id: 'frontend', name: 'Frontend Settings', icon: <Layout size={20} />, color: 'blue' },
  { id: 'backend', name: 'Backend Settings', icon: <Server size={20} />, color: 'green' },
  { id: 'general', name: 'General Settings', icon: <Settings size={20} />, color: 'purple' },
];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('frontend');
  const [viewMode, setViewMode] = useState<'database' | 'environment'>('database');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [editingEnvVar, setEditingEnvVar] = useState<EnvironmentVariable | null>(null);
  const [showDecrypted, setShowDecrypted] = useState<Record<number, boolean>>({});
  const [showSensitive, setShowSensitive] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingSettingId, setUploadingSettingId] = useState<number | null>(null);

  const handleFileUpload = async (setting: Setting, file: File) => {
    try {
      setUploadingSettingId(setting.id);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/settings/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.url) {
        const uploadedUrl = data.url;
        if (editingSetting?.id === setting.id) {
          setEditingSetting({ ...editingSetting, value: uploadedUrl });
        }
        setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: uploadedUrl } : s));
        setSuccess('File uploaded successfully! Click Save to confirm setting update.');
        setTimeout(() => setSuccess(null), 4000);
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to upload file attachment');
    } finally {
      setUploadingSettingId(null);
    }
  };

  // Temporary admin check
  const isAdmin = user?.isStaff || user?.email === 'admin@focused.com';

  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    category: 'frontend',
    setting_type: 'string',
    description: '',
    is_encrypted: false,
    is_public: false,
  });

  const [newEnvVar, setNewEnvVar] = useState({
    key: '',
    value: '',
    isSensitive: false,
    isComment: false,
    comment: ''
  });

  useEffect(() => {
    if (viewMode === 'database') {
      loadSettings();
    } else {
      loadEnvironmentVariables();
    }
  }, [activeCategory, viewMode]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/settings?category=${activeCategory}`, {
        headers,
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings || []);
      } else {
        setError('Failed to load settings');
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadEnvironmentVariables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/environment-variables', {
        headers,
      });
      const data = await response.json();
      if (data.success) {
        setEnvVars(data.envVars || []);
      } else {
        setError('Failed to load environment variables');
      }
    } catch (error) {
      console.error("Failed to load environment variables:", error);
      setError('Failed to load environment variables');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (setting: Setting) => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const payload = {
        id: setting.id,
        value: setting.is_encrypted ? setting.decryptedValue || setting.value : setting.value,
        description: setting.description,
        is_public: setting.is_public,
      };

      const response = await fetch(`/api/settings/${setting.id}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Setting updated successfully');
        loadSettings();
        setEditingSetting(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error("Failed to save setting:", error);
      setError('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const settingsToUpdate = settings.filter(s => s.id !== editingSetting?.id);
      const payload = {
        settings: settingsToUpdate.map(s => ({
          id: s.id,
          value: s.is_encrypted ? s.decryptedValue || s.value : s.value,
          description: s.description,
          is_public: s.is_public,
        }))
      };

      const response = await fetch('/api/settings/bulk_update/', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('All settings updated successfully');
        loadSettings();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSetting = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/settings/', {
        method: 'POST',
        headers,
        body: JSON.stringify(newSetting),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Setting added successfully');
        setShowAddModal(false);
        setNewSetting({
          key: '',
          value: '',
          category: activeCategory,
          setting_type: 'string',
          description: '',
          is_encrypted: false,
          is_public: false,
        });
        loadSettings();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to add setting');
      }
    } catch (error) {
      console.error("Failed to add setting:", error);
      setError('Failed to add setting');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSetting = async (settingId: number) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;

    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/settings/${settingId}/`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setSuccess('Setting deleted successfully');
        loadSettings();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to delete setting');
      }
    } catch (error) {
      console.error("Failed to delete setting:", error);
      setError('Failed to delete setting');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEnvVar = async (index: number, updates: Partial<EnvironmentVariable>) => {
    const updatedEnvVars = [...envVars];
    updatedEnvVars[index] = { ...updatedEnvVars[index], ...updates };
    setEnvVars(updatedEnvVars);
  };

  const handleSaveEnvVars = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/environment-variables', {
        method: 'POST',
        headers,
        body: JSON.stringify({ envVars }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(data.message || 'Environment variables updated successfully');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || 'Failed to update environment variables');
      }
    } catch (error) {
      console.error("Failed to save environment variables:", error);
      setError('Failed to save environment variables');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEnvVar = () => {
    setEnvVars([
      ...envVars,
      {
        key: '',
        value: '',
        isSensitive: false,
        isComment: false
      }
    ]);
  };

  const handleAddComment = () => {
    setEnvVars([
      ...envVars,
      {
        key: '',
        value: '',
        comment: '',
        isSensitive: false,
        isComment: true
      }
    ]);
  };

  const handleDeleteEnvVar = (index: number) => {
    if (!confirm('Are you sure you want to delete this environment variable?')) return;
    const updatedEnvVars = envVars.filter((_, i) => i !== index);
    setEnvVars(updatedEnvVars);
  };

  const toggleDecrypted = (settingId: number) => {
    setShowDecrypted(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'gray';
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
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-foreground/60 mt-2">Manage application configuration with encryption support</p>
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

          {/* View/Category Selection */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setViewMode('database')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                viewMode === 'database'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-ios-gray-800 text-foreground hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700'
              }`}
            >
              <Settings size={20} />
              Database Settings
            </button>
            <button
              onClick={() => setViewMode('environment')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                viewMode === 'environment'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-ios-gray-800 text-foreground hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700'
              }`}
            >
              <FileText size={20} />
              Environment Variables
            </button>
            
            {/* Category Tabs - only show for database mode */}
            {viewMode === 'database' && categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category.id
                    ? `bg-${category.color}-600 text-white`
                    : 'bg-white dark:bg-ios-gray-800 text-foreground hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {viewMode === 'database' ? (
              <>
                <button
                  onClick={() => {
                    setNewSetting({
                      key: '',
                      value: '',
                      category: activeCategory,
                      setting_type: 'string',
                      description: '',
                      is_encrypted: false,
                      is_public: false,
                    });
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Add New Setting
                </button>
                <button
                  onClick={handleBulkSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save All Changes'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddEnvVar}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Variable
                </button>
                <button
                  onClick={handleAddComment}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Comment
                </button>
                <button
                  onClick={handleSaveEnvVars}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Environment Variables'}
                </button>
                <button
                  onClick={loadEnvironmentVariables}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw size={20} />
                  Reload
                </button>
              </>
            )}
          </div>

          {/* Settings Grid */}
          {viewMode === 'database' ? (
            loading ? (
              <div className="text-center py-12 text-foreground/60">Loading settings...</div>
            ) : settings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-ios-gray-800 rounded-2xl">
                <Settings size={48} className="mx-auto text-foreground/40 mb-4" />
                <p className="text-foreground/60">No settings found in this category</p>
                <button
                  onClick={() => {
                    setNewSetting({
                      key: '',
                      value: '',
                      category: activeCategory,
                      setting_type: 'string',
                      description: '',
                      is_encrypted: false,
                      is_public: false,
                    });
                    setShowAddModal(true);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Add your first setting
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{setting.key}</h3>
                          {setting.is_encrypted && (
                            <span className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                              <Lock size={12} />
                              Encrypted
                            </span>
                          )}
                          {setting.is_public && (
                            <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">
                              <Globe size={12} />
                              Public
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/60 mb-2">{setting.description}</p>
                        <div className="text-xs text-foreground/40">
                          Type: {setting.typeDisplay} • Updated: {new Date(setting.updated_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSetting(setting)}
                          className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Settings size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(setting.id)}
                          className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {editingSetting?.id === setting.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Value {setting.key.toLowerCase().includes('favicon') ? '(URL or File Attachment)' : ''}
                          </label>

                          {(setting.key.toLowerCase().includes('favicon') || setting.key.toLowerCase().includes('logo') || setting.key.toLowerCase().includes('url') || setting.key.toLowerCase().includes('image')) && (
                            <div className="mb-3 p-3 bg-ios-gray-50 dark:bg-ios-gray-700/50 rounded-xl border border-ios-gray-200 dark:border-ios-gray-600 flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                                  <Upload size={14} />
                                  {uploadingSettingId === setting.id ? 'Uploading...' : 'Upload Attachment'}
                                  <input
                                    type="file"
                                    accept="image/*,.ico,.svg"
                                    className="hidden"
                                    disabled={uploadingSettingId === setting.id}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(setting, file);
                                    }}
                                  />
                                </label>
                                <span className="text-xs text-foreground/60">Upload file or enter URL below</span>
                              </div>
                              {setting.value && (
                                <div className="flex items-center gap-2 text-xs text-foreground/70">
                                  <span>Preview:</span>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={setting.value}
                                    alt="Preview"
                                    className="w-6 h-6 object-contain rounded border border-gray-300 dark:border-gray-600 bg-white"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="relative">
                            <input
                              type={showDecrypted[setting.id] ? "text" : (setting.is_encrypted ? "password" : "text")}
                              value={setting.is_encrypted ? (setting.decryptedValue || setting.value) : setting.value}
                              onChange={(e) => {
                                const updated = { ...setting };
                                if (setting.is_encrypted) {
                                  updated.decryptedValue = e.target.value;
                                } else {
                                  updated.value = e.target.value;
                                }
                                setEditingSetting(updated);
                              }}
                              className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                              placeholder="Value or URL"
                            />
                            {setting.is_encrypted && (
                              <button
                                onClick={() => toggleDecrypted(setting.id)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                              >
                                {showDecrypted[setting.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                          <textarea
                            value={setting.description}
                            onChange={(e) => setEditingSetting({ ...setting, description: e.target.value })}
                            className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.is_public}
                              onChange={(e) => setEditingSetting({ ...setting, is_public: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-foreground">Public (accessible by non-admin users)</span>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveSetting(editingSetting)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingSetting(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-ios-gray-200 dark:bg-ios-gray-700 text-foreground rounded-xl hover:bg-ios-gray-300 dark:hover:bg-ios-gray-600 transition-colors"
                          >
                            <X size={18} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          {(setting.key.toLowerCase().includes('favicon') || setting.key.toLowerCase().includes('logo')) && setting.value && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={setting.value}
                              alt="Favicon preview"
                              className="w-7 h-7 object-contain rounded border border-ios-gray-300 dark:border-ios-gray-600 bg-white p-0.5"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          )}
                          <code className="flex-1 px-4 py-2 bg-ios-gray-100 dark:bg-ios-gray-700 rounded-xl text-sm font-mono overflow-x-auto">
                            {setting.is_encrypted && !showDecrypted[setting.id] ? '••••••••••••' : (setting.decryptedValue || setting.value)}
                          </code>
                          {setting.is_encrypted && (
                            <button
                              onClick={() => toggleDecrypted(setting.id)}
                              className="p-2 text-foreground/60 hover:text-foreground"
                            >
                              {showDecrypted[setting.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            // Environment Variables View
            loading ? (
              <div className="text-center py-12 text-foreground/60">Loading environment variables...</div>
            ) : envVars.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-ios-gray-800 rounded-2xl">
                <FileText size={48} className="mx-auto text-foreground/40 mb-4" />
                <p className="text-foreground/60">No environment variables found</p>
                <button
                  onClick={handleAddEnvVar}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Add your first variable
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {envVars.map((envVar, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm"
                  >
                    {envVar.isComment ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-mono">#</span>
                        <input
                          type="text"
                          value={envVar.comment || ''}
                          onChange={(e) => handleUpdateEnvVar(index, { comment: e.target.value })}
                          className="flex-1 px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-ios-gray-50 dark:bg-ios-gray-700 text-foreground font-mono"
                          placeholder="Comment"
                        />
                        <button
                          onClick={() => handleDeleteEnvVar(index)}
                          className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">Key</label>
                              <input
                                type="text"
                                value={envVar.key}
                                onChange={(e) => handleUpdateEnvVar(index, { key: e.target.value })}
                                className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground font-mono"
                                placeholder="VARIABLE_NAME"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">Value</label>
                              <div className="relative">
                                <input
                                  type={showSensitive[index] ? "text" : "password"}
                                  value={envVar.value}
                                  onChange={(e) => handleUpdateEnvVar(index, { value: e.target.value })}
                                  className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground font-mono"
                                  placeholder="value"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSensitive(prev => ({ ...prev, [index]: !prev[index] }))}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                                >
                                  {showSensitive[index] ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {envVar.isSensitive && (
                              <span className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-1 rounded-full">
                                <Lock size={12} />
                                Sensitive
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteEnvVar(index)}
                              className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
        <Footer />
      </div>

      {/* Add Setting Modal */}
      {showAddModal && viewMode === 'database' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">Add New Setting</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Key</label>
                <input
                  type="text"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                  className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                  placeholder="e.g., API_KEY, MAX_UPLOAD_SIZE"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Value</label>
                <input
                  type="text"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                  className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  value={newSetting.setting_type}
                  onChange={(e) => setNewSetting({ ...newSetting, setting_type: e.target.value })}
                  className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
                  <option value="encrypted">Encrypted String</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                  className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                  rows={3}
                  placeholder="Describe what this setting does..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSetting.is_encrypted}
                    onChange={(e) => setNewSetting({ ...newSetting, is_encrypted: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Encrypt this value</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSetting.is_public}
                    onChange={(e) => setNewSetting({ ...newSetting, is_public: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Public (accessible by non-admin users)</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddSetting}
                disabled={saving || !newSetting.key || !newSetting.value}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Plus size={18} />
                {saving ? 'Adding...' : 'Add Setting'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-ios-gray-200 dark:bg-ios-gray-700 text-foreground rounded-xl hover:bg-ios-gray-300 dark:hover:bg-ios-gray-600 transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Environment Variable Modal */}
      {showAddModal && viewMode === 'environment' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">Add Environment Variable</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!newEnvVar.isComment}
                      onChange={() => setNewEnvVar({ ...newEnvVar, isComment: false })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Variable</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newEnvVar.isComment}
                      onChange={() => setNewEnvVar({ ...newEnvVar, isComment: true })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Comment</span>
                  </label>
                </div>
              </div>

              {newEnvVar.isComment ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Comment Text</label>
                  <textarea
                    value={newEnvVar.comment}
                    onChange={(e) => setNewEnvVar({ ...newEnvVar, comment: e.target.value })}
                    className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground"
                    rows={3}
                    placeholder="# Your comment here"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Key</label>
                    <input
                      type="text"
                      value={newEnvVar.key}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, key: e.target.value })}
                      className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground font-mono"
                      placeholder="VARIABLE_NAME"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Value</label>
                    <input
                      type="text"
                      value={newEnvVar.value}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
                      className="w-full px-4 py-2 border border-ios-gray-300 dark:border-ios-gray-600 rounded-xl bg-white dark:bg-ios-gray-700 text-foreground font-mono"
                      placeholder="value"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEnvVar.isSensitive}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, isSensitive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Mark as sensitive (contains password/secret)</span>
                  </label>
                </>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  if (newEnvVar.isComment) {
                    setEnvVars([...envVars, {
                      key: '',
                      value: '',
                      comment: newEnvVar.comment,
                      isSensitive: false,
                      isComment: true
                    }]);
                  } else {
                    setEnvVars([...envVars, {
                      key: newEnvVar.key,
                      value: newEnvVar.value,
                      isSensitive: newEnvVar.isSensitive,
                      isComment: false
                    }]);
                  }
                  setNewEnvVar({
                    key: '',
                    value: '',
                    isSensitive: false,
                    isComment: false,
                    comment: ''
                  });
                  setShowAddModal(false);
                }}
                disabled={saving || (newEnvVar.isComment ? !newEnvVar.comment : (!newEnvVar.key || !newEnvVar.value))}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Plus size={18} />
                Add Variable
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewEnvVar({
                    key: '',
                    value: '',
                    isSensitive: false,
                    isComment: false,
                    comment: ''
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-ios-gray-200 dark:bg-ios-gray-700 text-foreground rounded-xl hover:bg-ios-gray-300 dark:hover:bg-ios-gray-600 transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}