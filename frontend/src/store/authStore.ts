import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: authService.isAuthenticated(),
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, tokens } = await authService.login(credentials);
          authService.saveTokens(tokens);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user, tokens } = await authService.register(data);
          authService.saveTokens(tokens);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Registration failed. Please try again.';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await authService.logout();
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      },

      loadCurrentUser: async () => {
        if (!authService.isAuthenticated()) return;
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          authService.clearTokens();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'dpis-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
