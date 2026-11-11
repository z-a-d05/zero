import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { LoginCredentials, RegisterData, UserRole } from '../types';

export function useAuth() {
  const store = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await store.login(credentials);
      const role = store.user?.role;
      if (role === 'clinician' || role === 'admin') {
        navigate('/clinician');
      } else {
        navigate('/portal');
      }
    },
    [store, navigate],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      await store.register(data);
      const role: UserRole = data.role;
      if (role === 'clinician') {
        navigate('/clinician');
      } else {
        navigate('/portal');
      }
    },
    [store, navigate],
  );

  const logout = useCallback(async () => {
    await store.logout();
    navigate('/');
  }, [store, navigate]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login,
    register,
    logout,
    clearError: store.clearError,
  };
}
