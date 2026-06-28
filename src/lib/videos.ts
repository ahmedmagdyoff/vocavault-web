import { fetchApi } from './api';
import { Video, CreateVideoPayload } from '@/types';

export const videosApi = {
  async getVideos(): Promise<{ data: Video[] }> {
    return fetchApi<{ data: Video[] }>('/api/videos');
  },

  async createVideo(payload: CreateVideoPayload): Promise<{ data: Video }> {
    return fetchApi<{ data: Video }>('/api/videos', {
      method: 'POST',
      data: payload,
    });
  },

  async updateVideo(id: number, payload: CreateVideoPayload): Promise<{ data: Video }> {
    return fetchApi<{ data: Video }>(`/api/videos/${id}`, {
      method: 'PUT',
      data: payload,
    });
  },

  async deleteVideo(id: number): Promise<void> {
    return fetchApi<void>(`/api/videos/${id}`, {
      method: 'DELETE',
    });
  },
};
