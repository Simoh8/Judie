"use client";

import { useState } from "react";
import { X, Calendar, Clock, Users, Video } from "lucide-react";

// Extend Session type with ongoing session properties
interface ExtendedSession {
  isOngoing?: boolean;
  lastRegeneratedAt?: string | null;
  regenerateIntervalHours?: number;
}

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: any) => Promise<void>;
  initialData?: ExtendedSession | any;
  isOngoing?: boolean;
}

export default function SessionForm({ isOpen, onClose, onSubmit, initialData, isOngoing = false }: SessionFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    type: initialData?.type || "sprint",
    duration: initialData?.duration || 60,
    scheduledFor: initialData?.scheduledFor || "",
    facilitator: initialData?.facilitator || "",
    maxParticipants: initialData?.maxParticipants || 10,
    description: initialData?.description || "",
    isOngoing: (initialData as ExtendedSession)?.isOngoing || isOngoing || false,
    regenerateIntervalHours: (initialData as ExtendedSession)?.regenerateIntervalHours || 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For ongoing sessions, ensure isOngoing is set
      const submitData = {
        ...formData,
        isOngoing: formData.type === 'ongoing' || isOngoing,
        // Only include scheduledFor if it's not an ongoing session
        scheduledFor: (formData.type === 'ongoing' || isOngoing) ? undefined : formData.scheduledFor,
      };
      
      await onSubmit(submitData);
      onClose();
      setFormData({
        title: "",
        type: "sprint",
        duration: 60,
        scheduledFor: "",
        facilitator: "",
        maxParticipants: 10,
        description: "",
        isOngoing: isOngoing || false,
        regenerateIntervalHours: 5,
      });
    } catch (err) {
      setError("Failed to save session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-ios-gray-900 rounded-3xl p-8 w-full max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-foreground">
          {initialData ? "Edit Session" : "Create New Session"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Session Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
              placeholder="e.g., Morning Focus Sprint"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Session Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                required
              >
                <option value="sprint">Focus Sprint</option>
                <option value="deep-work">Deep Work</option>
                <option value="marathon">Marathon</option>
                <option value="ongoing">Ongoing Call</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground flex items-center gap-2">
                <Clock size={16} />
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                min="15"
                step="15"
                required
              />
            </div>
          </div>

          {(formData.type === 'ongoing' || isOngoing) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium">
                <Video size={16} />
                <span>Ongoing Call Settings</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Regenerate Zoom Meeting Every (hours)
                </label>
                <input
                  type="number"
                  value={formData.regenerateIntervalHours}
                  onChange={(e) => setFormData({ ...formData, regenerateIntervalHours: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                  min="1"
                  step="1"
                  required
                />
                <p className="text-xs text-foreground/60 mt-1">
                  The Zoom meeting will be automatically regenerated after this interval
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground flex items-center gap-2">
                <Calendar size={16} />
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                required={formData.type !== 'ongoing' && !isOngoing}
                disabled={formData.type === 'ongoing' || isOngoing}
              />
              {(formData.type === 'ongoing' || isOngoing) && (
                <p className="text-xs text-foreground/60 mt-1">
                  Ongoing calls are always available
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground flex items-center gap-2">
                <Users size={16} />
                Max Participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Facilitator Name</label>
            <input
              type="text"
              value={formData.facilitator}
              onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
              placeholder="Session facilitator"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground min-h-32"
              placeholder="Describe what this session is about..."
              rows={4}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-ios btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-ios btn-primary flex-1"
            >
              {loading ? "Saving..." : initialData ? "Update Session" : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
