import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authAPI, LoginResponse, userAPI } from '../lib/api';

// User interface
interface User {
  id: number;
  username: string;
  email: string;
  onboardingCompleted: boolean;
}

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  checkAuthStatus: () => Promise<void>;
  updateUserOnboardingStatus: (user: User) => void;
  clearAllData: () => Promise<void>;
}

// Custom storage for SecureStore
const secureStorage = {
  getItem: async (name: string) => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

// Create auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response: LoginResponse = await authAPI.login(username, password);
          
          const user: User = {
            id: response.userId,
            username: response.username,
            email: response.email,
            onboardingCompleted: response.onboardingCompleted
          };
          
          await SecureStore.setItemAsync('auth_token', response.token);
          await SecureStore.setItemAsync('user_data', JSON.stringify(user));
          
          set({
            user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await userAPI.register({ username, email, password });
          
          // Kayıt sonrası otomatik login
          await get().login(username, password);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        // Token'ları temizle
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      checkAuthStatus: async () => {
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          const userData = await SecureStore.getItemAsync('user_data');
          
          if (token && userData) {
            const user = JSON.parse(userData);
            set({
              user,
              token,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Auth status check failed:', error);
        }
      },

      updateUserOnboardingStatus: (user: User) => {
        set({ user });
        // Local storage'ı da güncelle
        SecureStore.setItemAsync('user_data', JSON.stringify(user));
      },
      clearAllData: async () => {
        // Tüm verileri temizle
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
        
        // Zustand store'u da temizle
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Zustand persist storage'ı da temizle
        await SecureStore.deleteItemAsync('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);