import { User, Session, SessionBooking } from "./types";

// In-memory database (for demo purposes)
// In production, this would be replaced with a real database like PostgreSQL, MongoDB, etc.
class Database {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private bookings: Map<string, SessionBooking> = new Map();
  private userSessions: Map<string, Set<string>> = new Map(); // userId -> sessionIds

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample sessions
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sampleSessions: Session[] = [
      {
        id: "1",
        title: "Morning Focus Sprint",
        type: "sprint",
        duration: 25,
        scheduledFor: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        facilitator: "Sarah Chen",
        maxParticipants: 10,
        currentParticipants: 5,
        participants: [],
        status: "scheduled",
        description: "Quick burst of productivity to start your day",
      },
      {
        id: "2",
        title: "Deep Work Session",
        type: "deep-work",
        duration: 50,
        scheduledFor: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
        facilitator: "Marcus Johnson",
        maxParticipants: 8,
        currentParticipants: 3,
        participants: [],
        status: "scheduled",
        description: "Extended_FOCUS session for meaningful work",
      },
      {
        id: "3",
        title: "Afternoon Marathon",
        type: "marathon",
        duration: 90,
        scheduledFor: tomorrow,
        facilitator: "Emily Rodriguez",
        maxParticipants: 12,
        currentParticipants: 7,
        participants: [],
        status: "scheduled",
        description: "Long session with built-in breaks for major milestones",
      },
    ];

    sampleSessions.forEach((session) => {
      this.sessions.set(session.id, session);
    });
  }

  // User operations
  createUser(email: string, name: string, password: string): User {
    const id = Math.random().toString(36).substr(2, 9);
    const user: User = {
      id,
      email,
      name,
      createdAt: new Date(),
      focusHours: 0,
      sessionsJoined: 0,
    };
    this.users.set(id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const updated = { ...user, ...updates };
      this.users.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Session operations
  createSession(session: Omit<Session, "id">): Session {
    const id = Math.random().toString(36).substr(2, 9);
    const newSession: Session = { ...session, id };
    this.sessions.set(id, newSession);
    return newSession;
  }

  getSessionById(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  getUpcomingSessions(): Session[] {
    const now = new Date();
    return Array.from(this.sessions.values())
      .filter((s) => s.scheduledFor > now && s.status === "scheduled")
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  updateSession(id: string, updates: Partial<Session>): Session | undefined {
    const session = this.sessions.get(id);
    if (session) {
      const updated = { ...session, ...updates };
      this.sessions.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Booking operations
  bookSession(sessionId: string, userId: string): SessionBooking | null {
    const session = this.sessions.get(sessionId);
    const user = this.users.get(userId);

    if (!session || !user) return null;
    if (session.currentParticipants >= session.maxParticipants) return null;
    if (session.participants.includes(userId)) return null;

    const bookingId = Math.random().toString(36).substr(2, 9);
    const booking: SessionBooking = {
      id: bookingId,
      sessionId,
      userId,
      bookedAt: new Date(),
      status: "confirmed",
    };

    this.bookings.set(bookingId, booking);

    // Update session
    session.participants.push(userId);
    session.currentParticipants++;
    this.sessions.set(sessionId, session);

    // Update user
    user.sessionsJoined++;
    this.users.set(userId, user);

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);

    return booking;
  }

  cancelBooking(bookingId: string): boolean {
    const booking = this.bookings.get(bookingId);
    if (!booking) return false;

    const session = this.sessions.get(booking.sessionId);
    const user = this.users.get(booking.userId);

    if (session && user) {
      session.participants = session.participants.filter((id) => id !== booking.userId);
      session.currentParticipants--;
      this.sessions.set(booking.sessionId, session);

      user.sessionsJoined--;
      this.users.set(booking.userId, user);

      this.userSessions.get(booking.userId)?.delete(booking.sessionId);
    }

    booking.status = "cancelled";
    this.bookings.set(bookingId, booking);
    return true;
  }

  getUserSessions(userId: string): Session[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];
    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter((s): s is Session => s !== undefined);
  }
}

// Singleton instance
const db = new Database();

export default db;
