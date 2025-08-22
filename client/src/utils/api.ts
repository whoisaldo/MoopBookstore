import axios from 'axios';

// Function to detect the running API server
const detectApiUrl = async (): Promise<string> => {
  // In production, always use the Heroku backend
  if (process.env.NODE_ENV === 'production') {
    return 'https://moops-bookstore-api-064ad9bcc3f1.herokuapp.com/api';
  }

  // Development mode - try to detect local server
  const ports = [5002, 5003, 5001, 5000];
  
  for (const port of ports) {
    try {
      const url = `http://localhost:${port}/api`;
      await axios.get(`${url}/health`, { timeout: 1000 });
      console.log(`✅ API server detected on port ${port}`);
      return url;
    } catch (error) {
      // Continue to next port
    }
  }
  
  // Fallback to Heroku backend if no local server found
  console.warn('⚠️ Could not detect local API server, using Heroku backend');
  return 'https://moops-bookstore-api-064ad9bcc3f1.herokuapp.com/api';
};

// Get API URL with proper fallback
export const getApiUrl = (): string => {
  // In production, always use Heroku
  if (process.env.NODE_ENV === 'production') {
    return 'https://moops-bookstore-api-064ad9bcc3f1.herokuapp.com/api';
  }
  
  // Check if we already detected the URL
  const cachedUrl = localStorage.getItem('api_url');
  if (cachedUrl) {
    return cachedUrl;
  }
  
  // Use environment variable or fallback to Heroku
  return process.env.REACT_APP_API_URL || 'https://moops-bookstore-api-064ad9bcc3f1.herokuapp.com/api';
};

// Initialize API URL detection
export const initializeApiUrl = async (): Promise<string> => {
  const url = await detectApiUrl();
  localStorage.setItem('api_url', url);
  return url;
};

// Create axios instance with dynamic base URL
export const createApiClient = () => {
  const apiUrl = getApiUrl();
  
  const client = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
  });
  
  // Add request interceptor to add auth token
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  return client;
};

export default createApiClient();
