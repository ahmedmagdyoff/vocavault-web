import { fetchApi } from './api';
import { Word } from '@/types';

export const wordsApi = {
  async getWords(): Promise<{ data: Word[] }> {
    return fetchApi<{ data: Word[] }>('/api/words');
  },

  async createWord(data: any): Promise<{ data: Word }> {
    return fetchApi<{ data: Word }>('/api/words', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateWord(id: number, data: any): Promise<{ data: Word }> {
    return fetchApi<{ data: Word }>(`/api/words/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteWord(id: number): Promise<void> {
    return fetchApi<void>(`/api/words/${id}`, {
      method: 'DELETE',
    });
  },
};
