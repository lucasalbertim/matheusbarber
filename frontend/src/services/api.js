import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});

const readStored = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};

// Rotas que pertencem ao painel administrativo.
const isAdminRoute = (url = '') => url.includes('/admin') || url.includes('/admins');

// Interceptor de requisição: anexa o token correto para cada área.
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';

    if (isAdminRoute(url)) {
      const admin = readStored('metheus_admin');
      if (admin?.token) {
        config.headers.Authorization = `Bearer ${admin.token}`;
      }
      return config;
    }

    // A área do cliente passou a exigir token. Antes não havia token de cliente
    // algum: os endpoints eram públicos e aceitavam qualquer ID na URL.
    const client = readStored('metheus_client');
    if (client?.access_token) {
      config.headers.Authorization = `Bearer ${client.access_token}`;
      return config;
    }

    // Endpoints do painel que não casam com o padrão acima (ex.: /services/, /attendance/)
    // continuam funcionando para o admin logado.
    const admin = readStored('metheus_admin');
    if (admin?.token) {
      config.headers.Authorization = `Bearer ${admin.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta: sessão inválida derruba apenas a área correspondente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const admin = readStored('metheus_admin');

      if (isAdminRoute(url) || admin?.token) {
        localStorage.removeItem('metheus_admin');
        window.location.href = '/admin/login';
      } else if (readStored('metheus_client')) {
        localStorage.removeItem('metheus_client');
        window.location.href = '/cliente/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
