// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',        // This works because of the proxy you set up
  timeout: 10000,
});

// Add JWT token automatically to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;