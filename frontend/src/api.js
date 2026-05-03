import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Add token to every request from localStorage as backup
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sessionToken');
  if (token) config.headers['x-session-token'] = token;
  return config;
});

export default API;
