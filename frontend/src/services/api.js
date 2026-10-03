import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Expired or invalid token -> back to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Works for our { message } errors and for ASP.NET validation errors
export function getErrorMessage(error) {
  // network error, CORS block or API down
  if (!error.response) return 'Cannot reach the server. Is the API running?';

  const { status, data } = error.response;
  if (data?.message) return data.message;
  if (data?.errors) return Object.values(data.errors).flat()[0];
  if (status === 403) return "You don't have permission to do that.";
  if (status === 401) return 'Your session has expired. Please log in again.';
  return 'Something went wrong. Please try again.';
}

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
};

export const bookApi = {
  getAll: async () => {
    const response = await apiClient.get('/books');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },
  create: async (bookData) => {
    const response = await apiClient.post('/books', bookData);
    return response.data;
  },
  update: async (id, bookData) => {
    const response = await apiClient.put(`/books/${id}`, bookData);
    return response.data;
  },
  delete: async (id) => {
    await apiClient.delete(`/books/${id}`); // 204 has no body
  },
};