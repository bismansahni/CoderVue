// Simple in-memory session store
// For production, consider using a database or distributed cache

interface SessionEntry {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface Session {
  history: SessionEntry[];
  lastAccessed: Date;
  metadata?: Record<string, any>;
}

class SessionStore {
  private sessions: Map<string, Session> = new Map();
  private readonly maxAge = 30 * 60 * 1000; // 30 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  get(sessionId: string): SessionEntry[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    // Check if session has expired
    const now = new Date();
    if (now.getTime() - session.lastAccessed.getTime() > this.maxAge) {
      this.sessions.delete(sessionId);
      return [];
    }

    // Update last accessed time
    session.lastAccessed = now;
    return session.history;
  }

  set(sessionId: string, history: SessionEntry[], metadata?: Record<string, any>): void {
    this.sessions.set(sessionId, {
      history,
      lastAccessed: new Date(),
      metadata
    });
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  has(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Check expiration
    const now = new Date();
    if (now.getTime() - session.lastAccessed.getTime() > this.maxAge) {
      this.sessions.delete(sessionId);
      return false;
    }

    return true;
  }

  getMetadata(sessionId: string): Record<string, any> | undefined {
    const session = this.sessions.get(sessionId);
    return session?.metadata;
  }

  private cleanup(): void {
    const now = new Date();
    const entries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of entries) {
      if (now.getTime() - session.lastAccessed.getTime() > this.maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Clean up on process exit
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessions.clear();
  }
}

// Create a singleton instance
const sessionStore = new SessionStore();

// Clean up on process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => sessionStore.destroy());
  process.on('SIGTERM', () => sessionStore.destroy());
}

export default sessionStore;