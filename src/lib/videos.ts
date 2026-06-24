import { fetchApi } from './api';
import { Video } from '@/types';

export const videosApi = {
  async getVideos(): Promise<{ data: Video[] }> {
    return fetchApi<{ data: Video[] }>('/api/videos');
  },

  async createVideo(data: any): Promise<{ data: Video }> {
    return fetchApi<{ data: Video }>('/api/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateVideo(id: number, data: any): Promise<{ data: Video }> {
    return fetchApi<{ data: Video }>(`/api/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteVideo(id: number): Promise<void> {
    return fetchApi<void>(`/api/videos/${id}`, {
      method: 'DELETE',
    });
  },
};
