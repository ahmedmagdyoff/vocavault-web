import axios from 'axios';

export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
};

// Create an Axios instance
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Crucial for Sanctum SPA Auth
  withXSRFToken: true,   // Crucial for cross-origin XSRF token attachment
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

// Wrapper to mimic the previous fetchApi signature and return only data
export async function fetchApi<T>(endpoint: string, options: any = {}): Promise<T> {
  const method = options.method || 'GET';
  const data = options.body ? JSON.parse(options.body) : undefined;
  const params = options.params;

  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      method,
      data,
      params,
      headers: options.headers,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw {
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
      };
    }
    throw error;
  }
}

export default apiClient;
