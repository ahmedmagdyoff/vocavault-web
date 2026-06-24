import apiClient, { fetchApi } from './api';
import { AuthResponse, User } from '@/types';

// Initialize CSRF cookie
export const initCsrf = async () => {
  return apiClient.get('/sanctum/csrf-cookie');
};

export const auth = {
  async register(data: any): Promise<AuthResponse> {
    await initCsrf();
    return fetchApi<AuthResponse>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: any): Promise<AuthResponse> {
    await initCsrf();
    return fetchApi<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/api/logout', {
      method: 'POST',
    });
  },

  async getUser(): Promise<User> {
    return fetchApi<User>('/api/user', {
      method: 'GET',
    });
  },
};
