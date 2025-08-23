import axios from 'axios';

// Simplified API URL configuration
const getApiUrl = (): string => {
  // Always prioritize environment variable if set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production (GitHub Pages), always use Heroku backend
  if (process.env.NODE_ENV === 'production') {
    return 'https://moops-bookstore-api-064ad9bcc3f1.herokuapp.com/api';
  }
  
  // Development mode - use localhost
  return 'http://localhost:5002/api';
};

// Create axios instance with proper base URL
export const createApiClient = () => {
  const apiUrl = getApiUrl();
  
  const client = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Add request interceptor to add auth token
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  // Add response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', error);
      }
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Export the default client instance
export default createApiClient();
