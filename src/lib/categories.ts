import { fetchApi } from './api';
import { Category } from '@/types';

export const categoriesApi = {
  async getCategories(): Promise<{ data: Category[] }> {
    return fetchApi<{ data: Category[] }>('/api/categories');
  },
};
