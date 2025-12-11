import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  // --- SỬA Ở ĐÂY: XÓA header Content-Type cứng nhắc ---
  headers: {
    // Để trống hoặc chỉ để các header chung khác nếu cần
    // Axios sẽ tự động set 'application/json' khi gửi object
    // Và tự động set 'multipart/form-data' khi gửi FormData (ảnh)
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