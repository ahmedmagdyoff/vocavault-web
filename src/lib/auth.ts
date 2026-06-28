import apiClient, { fetchApi } from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';

export const initCsrf = async () => {
  return apiClient.get('/sanctum/csrf-cookie');
};

export const auth = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await initCsrf();
    return fetchApi<AuthResponse>('/api/register', {
      method: 'POST',
      data: credentials,
    });
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await initCsrf();
    return fetchApi<AuthResponse>('/api/login', {
      method: 'POST',
      data: credentials,
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
