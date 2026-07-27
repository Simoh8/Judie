import { create } from 'zustand';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

interface UserStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  googleLogin: (email: string, name: string, token: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  loadUser: () => void;
  getUserSessions: () => Promise<any[]>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  loadUser: () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        set({ 
          token: storedToken, 
          user: JSON.parse(storedUser) 
        });
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.login(email, password);
      if (response.success && response.user && response.token) {
        set({ 
          user: response.user, 
          token: response.token, 
          loading: false 
        });
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      set({ error: 'Invalid credentials', loading: false });
      return false;
    } catch (error) {
      set({ error: 'Login failed', loading: false });
      return false;
    }
  },

  signup: async (email: string, name: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.signup(email, name, password);
      if (response.success && response.user && response.token) {
        set({ 
          user: response.user, 
          token: response.token, 
          loading: false 
        });
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      set({ error: 'Signup failed', loading: false });
      return false;
    } catch (error) {
      set({ error: 'Signup failed', loading: false });
      return false;
    }
  },

  googleLogin: async (email: string, name: string, token: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.googleLogin(email, name, token);
      if (response.success && response.user && response.token) {
        set({ 
          user: response.user, 
          token: response.token, 
          loading: false 
        });
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      set({ error: 'Google login failed', loading: false });
      return false;
    } catch (error) {
      set({ error: 'Google login failed', loading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, token: null, error: null });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const response = await api.updateUser(user.id.toString(), updates);
      if (response.success && response.user) {
        set({ 
          user: response.user, 
          loading: false 
        });
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        set({ error: 'Failed to update user', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to update user', loading: false });
    }
  },

  getUserSessions: async () => {
    const { user } = get();
    if (!user) return [];

    try {
      const response = await api.getUserSessions(user.id.toString());
      if (response.success && response.sessions) {
        return response.sessions;
      }
      return [];
    } catch (error) {
      return [];
    }
  },
}));
