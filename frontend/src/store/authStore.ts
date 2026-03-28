import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login(email, password);

          // Store user in state
          set({
            user: {
              id: response.user.id.toString(),
              email: response.user.email,
              name: response.user.name,
              role: response.user.role as UserRole,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store token is already handled by api.setToken()
          console.log("Login successful:", response.user);
        } catch (error: any) {
          set({
            error: error.message || "Login failed",
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      register: async (
        name: string,
        email: string,
        password: string,
        role: string,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.register(name, email, password, role);

          set({
            user: {
              id: response.user.id.toString(),
              email: response.user.email,
              name: response.user.name,
              role: response.user.role as UserRole,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log("Registration successful:", response.user);
        } catch (error: any) {
          set({
            error: error.message || "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        api.logout();
        set({ user: null, isAuthenticated: false, error: null });
      },

      checkAuth: async () => {
        // If we have a token but no user in store, try to fetch user
        if (api.isLoggedIn() && !get().user) {
          set({ isLoading: true });
          try {
            const userData = await api.getCurrentUser();
            set({
              user: {
                id: userData.id.toString(),
                email: userData.email,
                name: userData.name,
                role: userData.role as UserRole,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // Token might be invalid, logout
            api.logout();
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "artcraft-auth-storage",
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
