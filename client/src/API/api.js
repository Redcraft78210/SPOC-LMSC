// api.js
import axios from 'axios';

const baseURL = 'https://localhost:8443/api';

// Create an Axios instance
const api = axios.create({
  baseURL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add a request interceptor
api.interceptors.request.use(
  config => {
    // Example: Add auth token from localStorage/sessionStorage
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Optional: Add a response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Handle errors globally (e.g., unauthorized, server errors)
    if (error.response?.data?.message?.includes("invalid") && error.response?.data?.message?.includes("token")) {
      // Handle unauthorized access
      console.warn('Unauthorized. Redirecting to login...');

      window.location.href = '/logout'; // Redirect to login page
    } else if (error.response?.data?.message?.includes("User has already completed first login.")) {
      // Handle user already completed first login
      console.warn('User has already completed first login. Redirecting to dashboard...');
      window.location.href = '/logout'; // Redirect to dashboard
    }
    return Promise.reject(error);
  }
);

export default api;
