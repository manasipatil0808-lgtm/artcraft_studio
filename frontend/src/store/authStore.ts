import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email, role, name) => 
        set({ 
          user: { id: Math.random().toString(36).substr(2, 9), email, role, name }, 
          isAuthenticated: true 
        }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'handmade-auth-storage',
    }
  )
);
