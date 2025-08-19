import axios from 'axios';

// Function to detect the running API server
const detectApiUrl = async (): Promise<string> => {
  // In production, use the environment variable directly
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://your-heroku-app-name.herokuapp.com/api';
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
  
  // Fallback to default
  console.warn('⚠️ Could not detect API server, using default');
  return process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
};

// Get API URL with port detection
export const getApiUrl = (): string => {
  // Check if we already detected the URL
  const cachedUrl = localStorage.getItem('api_url');
  if (cachedUrl) {
    return cachedUrl;
  }
  
  // Use environment variable or fallback
  return process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
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
