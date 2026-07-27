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
  
  // Actions
  loadSessions: () => Promise<void>;
  createSession: (sessionData: any) => Promise<void>;
  updateSession: (id: string, sessionData: any) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  startSession: (id: string) => Promise<void>;
  endSession: (id: string) => Promise<void>;
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

  loadSessions: async () => {
    set({ loading: true, error: null });
    try {
      const { searchTerm, statusFilter, typeFilter } = get();
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await api.getSessions(params);
      if (response.success && response.sessions) {
        set({ sessions: response.sessions, loading: false });
      } else {
        set({ error: 'Failed to load sessions', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load sessions', loading: false });
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
