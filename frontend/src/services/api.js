import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
 
  headers: {

  },
});

// Interceptor: Tự động đính kèm Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;