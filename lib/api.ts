import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Base URL - Development için localhost
const API_BASE_URL = 'http://192.168.1.104:8080';

// Axios instance oluştur
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 durumunda token'ı temizle
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    }
    return Promise.reject(error);
  }
);

// Login Response Type
export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  isOnboardingCompleted: boolean;
}

// Auth API endpoints
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/user/create', userData);
    return response.data;
  },
  
  updateOnboarding: async (onboardingData: any) => {
    const response = await api.patch('/user/onboarding', onboardingData);
    return response.data;
  },
};