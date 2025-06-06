
import axios from 'axios';

const baseURL = '/api';


const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  config => {

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => Promise.reject(error)
);


api.interceptors.response.use(
  response => response,
  error => {

    if (error.response?.data?.message?.includes("invalid") && error.response?.data?.message?.includes("token")) {

      console.warn('Unauthorized. Redirecting to login...');

      window.location.href = '/logout';
    } else if (error.response?.data?.message?.includes("User has already completed first login.")) {

      console.warn('User has already completed first login. Redirecting to dashboard...');
      window.location.href = '/logout';
    }
    return Promise.reject(error);
  }
);

export default api;
