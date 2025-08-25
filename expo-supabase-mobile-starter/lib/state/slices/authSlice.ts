import { StateCreator } from 'zustand';

// Auth types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'staff' | 'readonly';
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
}

export interface AuthSlice {
  // State
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  
  // Actions
  login: (user: User, session: Session) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateSession: (session: Partial<Session>) => void;
  refreshSession: (session: Session) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  session: null,
  
  // Actions
  login: (user: User, session: Session) => {
    set({
      isAuthenticated: true,
      user,
      session,
    });
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      session: null,
    });
  },
  
  updateUser: (userUpdate: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          ...userUpdate,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  
  updateSession: (sessionUpdate: Partial<Session>) => {
    const currentSession = get().session;
    if (currentSession) {
      set({
        session: {
          ...currentSession,
          ...sessionUpdate,
        },
      });
    }
  },
  
  refreshSession: (newSession: Session) => {
    set({
      session: newSession,
    });
  },
});


