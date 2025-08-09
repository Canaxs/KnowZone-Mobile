import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from './config';


export const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.TIMEOUT,
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
  gender: string;
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

// Chat Message Type
export interface ChatMessageRequest {
  senderId: number;
  receiverId: number;
  content: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'MATCH_NOTIFICATION';
}

// Matches API endpoints
export const matchesAPI = {
  getUserMatches: async (userId: number): Promise<MatchResponse[]> => {
    const response = await api.get(`api/v1/matches/${userId}`);
    return response.data;
  },
  
  getUserAcceptedMatches: async (userId: number): Promise<MatchResponse[]> => {
    const response = await api.get(`api/v1/matches/${userId}/accepted`);
    return response.data;
  },

  getMatchById: async (matchId: number): Promise<MatchResponse> => {
    const response = await api.get(`api/v1/matches/detail/${matchId}`);
    return response.data;
  },
  
  respondToMatch: async (matchId: number, accepted: boolean) => {
    const response = await api.post(`/api/v1/matches/${matchId}/respond`, {
      accepted: accepted
    });
    return response.data;
  },

  updateLocation: async (locationData: LocationUpdateRequest) => {
    const response = await api.post(`/api/v1/location/update`, locationData);
    return response.data;
  },
};

// Chat API endpoints
export const chatAPI = {
  getChatHistory: async (user1Id: number, user2Id: number) => {
    const response = await api.get(`/api/chat/history/${user1Id}/${user2Id}`);
    return response.data;
  },

  sendMessage: async (messageData: ChatMessageRequest) => {
    const response = await api.post('/api/chat/send', messageData);
    return response.data;
  },
};