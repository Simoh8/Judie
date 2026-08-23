export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  createdAt: Date;
  focusHours: number;
  sessionsJoined: number;
  isStaff?: boolean;
}

export interface Session {
  id: string;
  title: string;
  type: "sprint" | "deep-work" | "marathon";
  duration: number; // in minutes
  scheduledFor: Date;
  facilitator: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: string[]; // user IDs
  status: "scheduled" | "live" | "completed";
  description: string;
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  zoomPassword?: string;
  averageRating?: number;
  leader?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export interface SessionBooking {
  id: string;
  sessionId: string;
  userId: string;
  bookedAt: Date;
  status: "confirmed" | "cancelled" | "completed";
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}
