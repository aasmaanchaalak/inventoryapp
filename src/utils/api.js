import axios from 'axios';

/**
 * Get the API base URL based on environment
 * Priority: REACT_APP_API_URL → Railway detection → localhost fallback
 */
const getApiBaseUrl = () => {
  // If explicitly set via environment variable, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Detect if we're in a Railway deployment
  if (window.location.hostname.includes('.railway.app')) {
    // Use the same domain for API calls (assuming backend is deployed on same Railway service)
    return `${window.location.protocol}//${window.location.hostname}`;
  }

  // Detect if we're in production but not Railway (custom domain)
  if (
    process.env.NODE_ENV === 'production' &&
    window.location.hostname !== 'localhost'
  ) {
    // Use the same domain for API calls
    return `${window.location.protocol}//${window.location.hostname}`;
  }

  // Development/localhost fallback
  return 'http://localhost:5001';
};

// Export the base URL for use in other components
export const API_BASE_URL = getApiBaseUrl();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);

    // Handle network errors
    if (!error.response) {
      console.error('Network error - server may be unreachable');
    }

    return Promise.reject(error);
  }
);

// Function to set auth token for requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default api;
