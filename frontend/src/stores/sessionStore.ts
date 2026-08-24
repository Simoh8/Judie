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
  loadSessions: () => Promise<void>;
  loadUserBookedSessions: (userId: string) => Promise<void>;
  createSession: (sessionData: any) => Promise<void>;
  updateSession: (id: string, sessionData: any) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  startSession: (id: string) => Promise<void>;
  endSession: (id: string) => Promise<void>;
  bookSession: (id: string, userId: string) => Promise<void>;
  cancelBooking: (id: string, userId: string) => Promise<void>;
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

  loadSessions: async () => {
    set({ loading: true, error: null });
    try {
      const { searchTerm, statusFilter, typeFilter, bookedSessionIds } = get();
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

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
        // Reload sessions to update isBooked status
        await get().loadSessions();
      }
    } catch (error) {
      console.error('Failed to load user booked sessions:', error);
    }
  },

  createSession: async (sessionData: any) => {
    set({ loading: true, error: null });
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
    set({ loading: true, error: null });
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
    set({ loading: true, error: null });
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
    set({ loading: true, error: null });
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
    set({ loading: true, error: null });
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

  bookSession: async (id: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.bookSession(id, userId);
      if (response.success) {
        // Add session to booked set
        set((state) => ({
          bookedSessionIds: new Set([...state.bookedSessionIds, id])
        }));
        // Reload sessions to get updated participant count and isBooked status
        await get().loadSessions();
        set({ loading: false });
      } else if (response.error === 'Already booked') {
        // If already booked, add to booked set and reload
        set((state) => ({
          bookedSessionIds: new Set([...state.bookedSessionIds, id])
        }));
        await get().loadSessions();
        set({ loading: false });
      } else {
        set({ error: 'Failed to book session', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to book session', loading: false });
    }
  },

  cancelBooking: async (id: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.cancelBooking(id, userId);
      if (response.success) {
        // Remove session from booked set
        set((state) => {
          const newBookedIds = new Set(state.bookedSessionIds);
          newBookedIds.delete(id);
          return { bookedSessionIds: newBookedIds };
        });
        // Reload sessions to get updated participant count and isBooked status
        await get().loadSessions();
        set({ loading: false });
      } else {
        set({ error: 'Failed to cancel booking', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to cancel booking', loading: false });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    get().loadSessions();
  },

  setStatusFilter: (filter: string) => {
    set({ statusFilter: filter });
    get().loadSessions();
  },

  setTypeFilter: (filter: string) => {
    set({ typeFilter: filter });
    get().loadSessions();
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
