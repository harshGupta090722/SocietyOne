import axios from 'axios';

// Backend runs on port 5000 according to index.js
const API_URL = 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to append the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;