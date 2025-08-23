import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from './config';
import { GroupChatMessage } from './websocketService';


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
  user1Response: string;
  user2Response: string;
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

  getAllUserMatches: async (userId: number): Promise<MatchResponse[]> => {
    const response = await api.get(`api/v1/matches/all/${userId}`);
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

// Group Types
export interface GroupResponse {
  id: number;
  name: string;
  description: string;
  region: {
    id: number;
    name: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  maxMembers: number;
  currentMembers: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  groupCreationType: string;
  createdAt: string;
  updatedAt: string;
}

// Groups API endpoints
export const groupsAPI = {
  getAllActiveGroups: async (): Promise<GroupResponse[]> => {
    const response = await api.get('/groups');
    return response.data;
  },

  getGroupById: async (groupId: number): Promise<GroupResponse> => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  getGroupsByRegion: async (regionId: number): Promise<GroupResponse[]> => {
    const response = await api.get(`/groups/region/${regionId}`);
    return response.data;
  },

  getNearbyGroups: async (latitude: number, longitude: number, radiusKm?: number): Promise<GroupResponse[]> => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radiusKm) {
      params.append('radiusKm', radiusKm.toString());
    }
    const response = await api.get(`/groups/nearby?${params.toString()}`);
    return response.data;
  },

  getNearbyInactiveGroups: async (latitude: number, longitude: number): Promise<GroupResponse[]> => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    const response = await api.get(`/groups/nearby-inactive?${params.toString()}`);
    return response.data;
  },

  getActiveGroupsNow: async (): Promise<GroupResponse[]> => {
    const response = await api.get('/groups/active-now');
    return response.data;
  },

  joinGroup: async (groupId: number): Promise<void> => {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data;
  },

  leaveGroup: async (groupId: number): Promise<void> => {
    const response = await api.delete(`/groups/${groupId}/leave`);
    return response.data;
  },

  getGroupMembers: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  },

  getUserGroups: async (): Promise<GroupResponse[]> => {
    const response = await api.get('/groups/user');
    return response.data;
  },
};

// Group Chat API endpoints
export const groupChatAPI = {
  getGroupChatHistory: async (groupId: number): Promise<GroupChatMessage[]> => {
    const response = await api.get(`/group-chats/history/${groupId}`);
    return response.data;
  },
};