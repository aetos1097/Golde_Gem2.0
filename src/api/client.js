const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5233';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }

  return data;
}

// ── Auth ──
export const authApi = {
  login: (credentials) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// ── Products ──
export const productApi = {
  search: (query) => request(`/api/product/search?q=${encodeURIComponent(query)}`),
  getById: (id) => request(`/api/product/${id}`),
  getByCompany: (companyId) => request(`/api/product/by-company/${companyId}`),
  getByType: (typeId) => request(`/api/product/by-type/${typeId}`),
  create: (product) =>
    request('/api/product/create', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  update: (id, product) =>
    request(`/api/product/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  delete: (id) =>
    request(`/api/product/${id}`, { method: 'DELETE' }),
};

// ── Companies ──
export const companyApi = {
  getAll: () => request('/api/company/all'),
  getById: (id) => request(`/api/company/${id}`),
  register: (company) =>
    request('/api/company/register', {
      method: 'POST',
      body: JSON.stringify(company),
    }),
};

// ── Chat ──
export const chatApi = {
  startConversation: (productId) =>
    request('/api/chat/start', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  getMyConversations: () => request('/api/chat/my-conversations'),
  getMessages: (conversationId, page = 1) =>
    request(`/api/chat/${conversationId}/messages?page=${page}`),
  sendMessage: (conversationId, content) =>
    request(`/api/chat/${conversationId}/send`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  offerPrice: (conversationId, price) =>
    request(`/api/chat/${conversationId}/offer-price`, {
      method: 'POST',
      body: JSON.stringify({ price }),
    }),
  acceptPrice: (conversationId) =>
    request(`/api/chat/${conversationId}/accept-price`, { method: 'POST' }),
  rejectPrice: (conversationId) =>
    request(`/api/chat/${conversationId}/reject-price`, { method: 'POST' }),
  closeConversation: (conversationId) =>
    request(`/api/chat/${conversationId}/close`, { method: 'POST' }),
  getWhatsAppLink: (productId) => request(`/api/chat/whatsapp/${productId}`),
};
