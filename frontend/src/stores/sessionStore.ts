import { create } from 'zustand';
import { Session } from '@/lib/types';
import { api } from '@/lib/api';

interface SessionStore {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  bookedSessionIds: Set<string>;
  
  // Actions
  loadSessions: (silent?: boolean, includePast?: boolean) => Promise<void>;
  loadUserBookedSessions: (userId: string) => Promise<void>;
  createSession: (sessionData: any) => Promise<void>;
  updateSession: (id: string, sessionData: any) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  startSession: (id: string) => Promise<void>;
  endSession: (id: string) => Promise<void>;
  regenerateZoom: (id: string) => Promise<void>;
  bookSession: (id: string, userId: string) => Promise<void>;
  cancelBooking: (id: string, userId: string) => Promise<void>;
  leaveSession: (id: string, userId: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  setTypeFilter: (filter: string) => void;
  getParticipants: (id: string) => Promise<any[]>;
  getStats: () => Promise<any>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  loading: false,
  error: null,
  searchTerm: '',
  statusFilter: '',
  typeFilter: '',
  bookedSessionIds: new Set<string>(),

  loadSessions: async (silent = false, includePast = false) => {
    if (!silent && get().sessions.length === 0) {
      set({ loading: true, error: null });
    }
    try {
      const { searchTerm, statusFilter, typeFilter, bookedSessionIds } = get();
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (includePast) params.include_past = 'true';

      const response = await api.getSessions(params);
      if (response.success && response.sessions) {
        // Add isBooked property to each session based on bookedSessionIds
        const sessionsWithBookingStatus = response.sessions.map((session: Session) => ({
          ...session,
          isBooked: bookedSessionIds.has(session.id)
        }));
        set({ sessions: sessionsWithBookingStatus, loading: false });
      } else {
        set({ error: 'Failed to load sessions', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load sessions', loading: false });
    }
  },

  loadUserBookedSessions: async (userId: string) => {
    try {
      const response = await api.getUserSessions(userId);
      if (response.success && response.sessions) {
        const bookedIds = new Set(response.sessions.map((s: Session) => s.id));
        set({ bookedSessionIds: bookedIds });
        // Reload sessions silently to update isBooked status
        await get().loadSessions(true);
      }
    } catch (error) {
      console.error('Failed to load user booked sessions:', error);
    }
  },

  createSession: async (sessionData: any) => {
    try {
      const response = await api.createSession(sessionData);
      if (response.success && response.session) {
        set((state) => ({
          sessions: [response.session!, ...state.sessions],
          loading: false
        }));
      } else {
        set({ error: 'Failed to create session', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to create session', loading: false });
    }
  },

  updateSession: async (id: string, sessionData: any) => {
    try {
      const response = await api.updateSession(id, sessionData);
      if (response.success && response.session) {
        set((state) => ({
          sessions: state.sessions.map((s) => s.id === id ? response.session! : s),
          loading: false
        }));
      } else {
        set({ error: 'Failed to update session', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to update session', loading: false });
    }
  },

  deleteSession: async (id: string) => {
    try {
      const response = await api.deleteSession(id);
      if (response.success) {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          loading: false
        }));
      } else {
        set({ error: 'Failed to delete session', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to delete session', loading: false });
    }
  },

  startSession: async (id: string) => {
    try {
      const response = await api.startSession(id);
      if (response.success && response.session) {
        set((state) => ({
          sessions: state.sessions.map((s) => s.id === id ? response.session! : s),
          loading: false
        }));
      } else {
        set({ error: 'Failed to start session', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to start session', loading: false });
    }
  },

  endSession: async (id: string) => {
    try {
      const response = await api.endSession(id);
      if (response.success && response.session) {
        set((state) => ({
          sessions: state.sessions.map((s) => s.id === id ? response.session! : s),
          loading: false
        }));
      } else {
        set({ error: 'Failed to end session', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to end session', loading: false });
    }
  },

  regenerateZoom: async (id: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}/regenerate-zoom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      
      if (data.success && data.session) {
        set((state) => ({
          sessions: state.sessions.map((s) => s.id === id ? data.session : s),
          loading: false
        }));
      } else {
        set({ error: data.error || 'Failed to regenerate Zoom meeting', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to regenerate Zoom meeting', loading: false });
    }
  },

  bookSession: async (id: string, userId: string) => {
    try {
      const response = await api.bookSession(id, userId);
      if (response.success || response.error === 'Already booked') {
        const updatedApiSession = response.session;
        set((state) => {
          const newBookedIds = new Set(state.bookedSessionIds);
          newBookedIds.add(id);
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === id) {
              return {
                ...(updatedApiSession || s),
                isBooked: true,
                currentParticipants: updatedApiSession
                  ? updatedApiSession.currentParticipants
                  : Math.min(s.maxParticipants, s.currentParticipants + 1),
              };
            }
            return s;
          });
          return {
            bookedSessionIds: newBookedIds,
            sessions: updatedSessions,
          };
        });
        // Background silent sync
        get().loadSessions(true);
      } else {
        set({ error: 'Failed to book session' });
      }
    } catch (error) {
      set({ error: 'Failed to book session' });
    }
  },

  cancelBooking: async (id: string, userId: string) => {
    try {
      const response = await api.cancelBooking(id, userId);
      if (response.success) {
        const updatedApiSession = response.session;
        set((state) => {
          const newBookedIds = new Set(state.bookedSessionIds);
          newBookedIds.delete(id);
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === id) {
              return {
                ...(updatedApiSession || s),
                isBooked: false,
                currentParticipants: updatedApiSession
                  ? updatedApiSession.currentParticipants
                  : Math.max(0, s.currentParticipants - 1),
              };
            }
            return s;
          });
          return {
            bookedSessionIds: newBookedIds,
            sessions: updatedSessions,
          };
        });
        // Background silent sync
        get().loadSessions(true);
      } else {
        set({ error: 'Failed to cancel booking' });
      }
    } catch (error) {
      set({ error: 'Failed to cancel booking' });
    }
  },

  leaveSession: async (id: string, userId: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}/leave-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      
      if (data.success) {
        const updatedApiSession = data.session;
        set((state) => {
          const newBookedIds = new Set(state.bookedSessionIds);
          newBookedIds.delete(id);
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === id) {
              return {
                ...(updatedApiSession || s),
                isBooked: false,
                currentParticipants: updatedApiSession
                  ? updatedApiSession.currentParticipants
                  : Math.max(0, s.currentParticipants - 1),
              };
            }
            return s;
          });
          return {
            bookedSessionIds: newBookedIds,
            sessions: updatedSessions,
          };
        });
        // Background silent sync
        get().loadSessions(true);
      } else {
        set({ error: 'Failed to leave session' });
      }
    } catch (error) {
      set({ error: 'Failed to leave session' });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    get().loadSessions(true);
  },

  setStatusFilter: (filter: string) => {
    set({ statusFilter: filter });
    get().loadSessions(true);
  },

  setTypeFilter: (filter: string) => {
    set({ typeFilter: filter });
    get().loadSessions(true);
  },

  getParticipants: async (id: string) => {
    try {
      const response = await api.getSessionParticipants(id);
      if (response.success && response.participants) {
        return response.participants;
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  getStats: async () => {
    try {
      const response = await api.getSessionStats();
      if (response.success && response.stats) {
        return response.stats;
      }
      return null;
    } catch (error) {
      return null;
    }
  },
}));
