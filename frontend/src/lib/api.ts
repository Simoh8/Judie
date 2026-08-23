import { User, Session, AuthResponse } from "./types";

const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  async signup(email: string, name: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async googleLogin(email: string, name: string, token: string): Promise<AuthResponse> {
    // The backend verifies the Google ID token and extracts email/name from it.
    // The `email` and `name` params are fallbacks only (backend ignores them if token is valid).
    const response = await fetch(`${API_BASE}/auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return response.json();
  },

  // Sessions
  async getSessions(params?: { type?: string; upcoming?: boolean }): Promise<{ success: boolean; sessions?: Session[]; error?: string }> {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE}/sessions/${queryString ? `?${queryString}` : ""}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async getSession(id: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async bookSession(sessionId: string, userId: string): Promise<{ success: boolean; booking?: any; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/book/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  },

  async cancelBooking(sessionId: string, userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/cancel_booking/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  },

  // Users
  async getUser(id: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await fetch(`${API_BASE}/users/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async getUserSessions(id: string): Promise<{ success: boolean; sessions?: Session[]; error?: string }> {
    const response = await fetch(`${API_BASE}/users/${id}/sessions/`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async updateUser(id: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await fetch(`${API_BASE}/users/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Session Management (Admin)
  async createSession(sessionData: any): Promise<{ success: boolean; session?: Session; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(sessionData),
    });
    return response.json();
  },

  async updateSession(id: string, sessionData: any): Promise<{ success: boolean; session?: Session; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(sessionData),
    });
    return response.json();
  },

  async deleteSession(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.ok ? { success: true } : { success: false, error: "Failed to delete session" };
  },

  async startSession(id: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/${id}/start_session/`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async endSession(id: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/${id}/end_session/`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async getSessionParticipants(id: string): Promise<{ success: boolean; participants?: any[]; count?: number; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/${id}/participants/`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async getSessionStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    const response = await fetch(`${API_BASE}/sessions/stats/`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
