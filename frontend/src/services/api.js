import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const admin = JSON.parse(localStorage.getItem('metheus_admin'));
    if (admin?.token) {
      config.headers.Authorization = `Bearer ${admin.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const admin = JSON.parse(localStorage.getItem('metheus_admin'));
      const isAdminRequest = requestUrl.includes('/admin') || requestUrl.includes('/admins');
      if (admin?.token || isAdminRequest) {
        // Token expirado ou inválido
        localStorage.removeItem('metheus_admin');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
