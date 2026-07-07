import axios from 'axios';

export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000',
};

const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function fetchApi<T>(endpoint: string, options: {
  method?: string;
  data?: unknown;
  params?: Record<string, unknown>;
} = {}): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      method: options.method || 'GET',
      data: options.data,
      params: options.params,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new ApiError(
        error.response.status,
        error.response.data.message || 'An error occurred',
        error.response.data.errors,
      );
    }
    throw error;
  }
}

export default apiClient;
