import { fetchApi } from './api';
import { Word, CreateWordPayload } from '@/types';

export interface BulkReportRow {
  line: number;
  word?: string | null;
  success: boolean;
  status: string;
  message: string;
}

export const wordsApi = {
  async getWords(): Promise<{ data: Word[] }> {
    return fetchApi<{ data: Word[] }>('/api/words');
  },

  async createWord(payload: CreateWordPayload): Promise<{ data: Word }> {
    return fetchApi<{ data: Word }>('/api/words', {
      method: 'POST',
      data: payload,
    });
  },

  async updateWord(id: number, payload: CreateWordPayload): Promise<{ data: Word }> {
    return fetchApi<{ data: Word }>(`/api/words/${id}`, {
      method: 'PUT',
      data: payload,
    });
  },

  async deleteWord(id: number): Promise<void> {
    return fetchApi<void>(`/api/words/${id}`, {
      method: 'DELETE',
    });
  },

  async bulkCreateWords(payload: { rows: string; category_id: string; video_id: number }): Promise<{ report: BulkReportRow[] }> {
    return fetchApi<{ report: BulkReportRow[] }>('/api/words/bulk', {
      method: 'POST',
      data: payload,
    });
  },
};
