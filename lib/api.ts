import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Base URL - Development için localhost
const API_BASE_URL = 'http://192.168.1.105:8080';

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
  onboardingCompleted: boolean;
}

// User Response Type
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  hobbies: string[];
  interests: string[];
  idealPerson: string[];
  isOnboardingCompleted: boolean;
}

// Auth API endpoints
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

// Match Response Type
export interface MatchResponse {
  id: number;
  user1Id: number;
  user2Id: number;
  compatibilityScore: number;
  commonTopic: string | null;
  keywords: string[] | null;
  status: string;
  createdAt: string;
  expiresAt: string;
}

// User API endpoints
export const userAPI = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/user/create', userData);
    return response.data;
  },
  
  findById: async (userId: number): Promise<UserResponse> => {
    const response = await api.get(`/user/findById/${userId}`);
    return response.data;
  },
  
  updateOnboarding: async (onboardingData: {
    hobbies: string[];
    interests: string[];
    idealPersonTraits: string[];
  }) => {
    const response = await api.patch('/user/onboarding', onboardingData);
    return response.data;
  },
};

// Location Update Type
export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
}

// Matches API endpoints
export const matchesAPI = {
  getUserMatches: async (userId: number): Promise<MatchResponse[]> => {
    const response = await api.get(`api/v1/matches/${userId}`);
    return response.data;
  },
  
  respondToMatch: async (matchId: number, accepted: boolean) => {
    const response = await api.post(`/matches/${matchId}/respond`, {
      accepted: accepted
    });
    return response.data;
  },

  updateLocation: async (locationData: LocationUpdateRequest) => {
    const response = await api.post(`/api/v1/location/update`, locationData);
    return response.data;
  },
};