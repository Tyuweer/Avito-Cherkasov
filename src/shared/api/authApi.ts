// src/shared/api/authApi.ts
import type { IUser, ApiResponse } from './types';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: IUser;
}

// Mock JWT token generator
const generateMockToken = (username: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Mock delay simulation
const mockDelay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  /**
   * POST /api/v1/login
   * Mock implementation - replace with axios call when backend is ready
   */
  login: async ({ username, password }: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    await mockDelay(800);

    // Simple validation mock
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Generate mock response
    const token = generateMockToken(username);
    const user: IUser = {
      id: Date.now(),
      username,
      rating: 5.0,
      declineCount: 0,
      avatarUrl: undefined,
      pvzAddress: undefined,
    };

    return {
      data: { token, user },
      message: 'Login successful',
    };
  },

  /**
   * POST /api/v1/register
   * Mock implementation - replace with axios call when backend is ready
   */
  register: async ({ username, password, email }: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    await mockDelay(800);

    // Simple validation mock
    if (!username || !password || !email) {
      throw new Error('Username, password and email are required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Generate mock response
    const token = generateMockToken(username);
    const user: IUser = {
      id: Date.now(),
      username,
      rating: 5.0,
      declineCount: 0,
      avatarUrl: undefined,
      pvzAddress: undefined,
    };

    return {
      data: { token, user },
      message: 'Registration successful',
    };
  },
};

// Ready-to-use axios implementation (uncomment and comment out mock above when backend is ready):
/*
export const authApi = {
  login: async ({ username, password }: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/v1/login', { username, password });
    return response.data;
  },

  register: async ({ username, password, email }: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/v1/register', { username, password, email });
    return response.data;
  },
};
*/