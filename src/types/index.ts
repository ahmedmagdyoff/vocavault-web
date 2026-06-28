export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: number;
  user_id: number;
  title: string;
  url: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'other';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface WordForm {
  id: number;
  form_type: string;
  value: string;
}

export interface Word {
  id: number;
  user_id: number;
  category_id: number;
  word: string;
  meaning: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  videos?: Video[];
  forms?: WordForm[];
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// --- Request payload types ---

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CreateVideoPayload {
  title: string;
  url: string;
  platform: string;
}

export interface CreateWordPayload {
  word: string;
  meaning: string;
  category_id?: number;
  video_ids?: number[];
  forms?: { form_type: string; value: string }[];
}
