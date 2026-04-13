const API_URL = import.meta.env.VITE_BASE44_APP_BASE_URL || 'http://localhost:3000/api';

async function apiFetch(endpoint, options = {}, isFormData = false) {
  const token = localStorage.getItem('base44_access_token') || localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { 
      status: response.status, 
      data: errorData, 
      message: errorData.message || 'Erro na requisição da API' 
    };
  }

  if (response.status === 204) return true;
  
  return response.json();
}

const createEntityAPI = (endpointName) => ({
  list: async (sort = '', limit = 50) => {
    const params = new URLSearchParams();
    if (sort) params.append('_sort', sort);
    if (limit) params.append('_limit', limit);
    return apiFetch(`/${endpointName}?${params.toString()}`);
  },
  
  filter: async (filters = {}, sort = '', limit = 50) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    if (sort) params.append('_sort', sort);
    if (limit) params.append('_limit', limit);
    return apiFetch(`/${endpointName}?${params.toString()}`);
  },
  
  create: async (data) => apiFetch(`/${endpointName}`, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  
  update: async (id, data) => apiFetch(`/${endpointName}/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  
  delete: async (id) => apiFetch(`/${endpointName}/${id}`, { 
    method: 'DELETE' 
  }),
});

export const base44 = {
  auth: {
    me: async () => apiFetch('/auth/me'),
    updateMe: async (data) => apiFetch('/auth/me', { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    login: async (credentials) => {
      const res = await apiFetch('/auth/login', { 
        method: 'POST', 
        body: JSON.stringify(credentials) 
      });
      if (res.token) {
        localStorage.setItem('base44_access_token', res.token);
      }
      return res.user;
    },
    register: async (userData) => {
      const res = await apiFetch('/auth/register', { 
        method: 'POST', 
        body: JSON.stringify(userData) 
      });
      if (res.token) {
        localStorage.setItem('base44_access_token', res.token);
      }
      return res.user;
    },
    logout: (redirectUrl) => {
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
      if (redirectUrl) window.location.href = redirectUrl;
      else window.location.reload();
    },
    redirectToLogin: (currentUrl) => {
      window.location.href = `/login?redirect=${encodeURIComponent(currentUrl || '/')}`;
    }
  },
  
  entities: {
    User: createEntityAPI('users'),
    Product: createEntityAPI('products'),
    Order: createEntityAPI('orders'),
    Quote: createEntityAPI('quotes'),
    Review: createEntityAPI('reviews'),
    CartItem: createEntityAPI('cart-items')
  },
  
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiFetch('/upload', { method: 'POST', body: formData }, true);
      }
    }
  }
};