import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          toast.success('Registration successful!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          toast.success('Welcome back!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      loginWithGoogle: () => {
        window.location.href = authAPI.googleAuthUrl();
      },

      handleOAuthCallback: (token) => {
        if (token) {
          localStorage.setItem('token', token);
          set({ token, isAuthenticated: true });
          // Fetch user data
          get().fetchUser();
          toast.success('Google login successful!');
          return true;
        }
        return false;
      },

      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authAPI.getUser();
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          // If fetch fails, clear auth state
          if (error.response?.status === 401) {
            get().logout();
          }
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.updateProfile(data);
          set({ user: response.data.user, isLoading: false });
          toast.success('Profile updated successfully!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Update failed';
          set({ error: message, isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.changePassword(data);
          set({ isLoading: false });
          toast.success('Password changed successfully!');
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Password change failed';
          set({ error: message, isLoading: false });
          toast.error(message);
          return { success: false, error: message };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, error: null });
        toast.success('Logged out successfully');
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
