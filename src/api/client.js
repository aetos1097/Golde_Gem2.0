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

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    // ASP.NET ModelState validation errors: { errors: { Field: ["msg", ...] } }
    if (data.errors && typeof data.errors === 'object') {
      const msgs = Object.values(data.errors).flat().filter(Boolean);
      if (msgs.length) throw new Error(msgs.join(' · '));
    }
    throw new Error(data.message || data.title || `Error ${res.status}`);
  }

  return data;
}

async function uploadFile(endpoint, file) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al subir archivo');
  return data;
}

// ── Profile ──
export const profileApi = {
  getMe: () => request('/api/person/me'),
  createMe: (data) => request('/api/person/me', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/person/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadPhoto: (id, file) => uploadFile(`/api/person/${id}/photo`, file),
  deletePhoto: (id) => request(`/api/person/${id}/photo`, { method: 'DELETE' }),
};

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
  update: (id, company) =>
    request(`/api/company/${id}`, {
      method: 'PUT',
      body: JSON.stringify(company),
    }),
  uploadLogo: (id, file) => uploadFile(`/api/company/${id}/logo`, file),
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

// ── Product Images ──
export const productImageApi = {
  getByProduct: (productId) => request(`/api/product/${productId}/images`),
  upload: (productId, file) => uploadFile(`/api/product/${productId}/images`, file),
  setPrimary: (productId, imageId) =>
    request(`/api/product/${productId}/images/${imageId}/primary`, { method: 'PUT' }),
  delete: (productId, imageId) =>
    request(`/api/product/${productId}/images/${imageId}`, { method: 'DELETE' }),
};

// ── Orders ──
export const orderApi = {
  create: (data) => request('/api/order/create', { method: 'POST', body: JSON.stringify(data) }),
  getById: (id) => request(`/api/order/${id}`),
  getMyOrders: () => request('/api/order/my-orders'),
  cancel: (id) => request(`/api/order/${id}/cancel`, { method: 'POST' }),
};

// ── Payments ──
export const paymentApi = {
  initiate: (data) => request('/api/payment/initiate', { method: 'POST', body: JSON.stringify(data) }),
  confirm: (data) => request('/api/payment/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getByOrder: (orderId) => request(`/api/payment/by-order/${orderId}`),
};

// ── Preferences ──
export const preferencesApi = {
  get: () => request('/api/preferences'),
  update: (data) => request('/api/preferences', { method: 'PUT', body: JSON.stringify(data) }),
  delete: () => request('/api/preferences', { method: 'DELETE' }),
};

// ── Product Types ──
export const productTypeApi = {
  getAll: () => request('/api/product-type/all'),
  getById: (id) => request(`/api/product-type/${id}`),
  create: (data) => request('/api/product-type/create', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/product-type/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/api/product-type/${id}`, { method: 'DELETE' }),
};

// ── Lookups (cualquier usuario autenticado) ──
export const lookupApi = {
  getDocumentTypes: () => request('/api/lookup/document-types'),
};

// ── Departments & Municipalities ──
export const departmentApi = {
  getAll: () => request('/api/department/all'),
  getById: (id) => request(`/api/department/${id}`),
};

export const municipalityApi = {
  getAll: () => request('/api/municipality/all'),
  getById: (id) => request(`/api/municipality/${id}`),
  getByDepartmentId: (departmentId) => request(`/api/municipality/by-department/${departmentId}`),
};

// ── Dashboard ──
export const dashboardApi = {
  getStats: () => request('/api/dashboard/stats'),
};

// ── Admin ──
export const adminApi = {
  // Users
  createUser: (data) => request('/api/auth/create', { method: 'POST', body: JSON.stringify(data) }),
  getAllUsers: () => request('/api/person/all'),
  getUserById: (id) => request(`/api/person/${id}`),
  updateUser: (id, data) => request(`/api/person/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/api/person/${id}`, { method: 'DELETE' }),

  // Roles
  createRole: (data) => request('/api/role/create', { method: 'POST', body: JSON.stringify(data) }),
  getAllRoles: () => request('/api/role/all'),
  updateRole: (id, data) => request(`/api/role/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (id) => request(`/api/role/${id}`, { method: 'DELETE' }),

  // Modules
  createModule: (data) => request('/api/module/create', { method: 'POST', body: JSON.stringify(data) }),
  getAllModules: () => request('/api/module/all'),
  getModuleById: (id) => request(`/api/module/${id}`),
  updateModule: (id, data) => request(`/api/module/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteModule: (id) => request(`/api/module/${id}`, { method: 'DELETE' }),

  // Forms
  createForm: (data) => request('/api/form/create', { method: 'POST', body: JSON.stringify(data) }),
  getAllForms: () => request('/api/form/all'),
  getFormById: (id) => request(`/api/form/${id}`),
  getFormsByModule: (moduleId) => request(`/api/form/by-module/${moduleId}`),
  updateForm: (id, data) => request(`/api/form/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteForm: (id) => request(`/api/form/${id}`, { method: 'DELETE' }),

  // Actions
  createAction: (data) => request('/api/action/create', { method: 'POST', body: JSON.stringify(data) }),
  getAllActions: () => request('/api/action/all'),
  updateAction: (id, data) => request(`/api/action/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAction: (id) => request(`/api/action/${id}`, { method: 'DELETE' }),

  // Action Types
  createActionType: (data) => request('/api/action-type/create', { method: 'POST', body: JSON.stringify(data) }),
  getAllActionTypes: () => request('/api/action-type/all'),
  updateActionType: (id, data) => request(`/api/action-type/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActionType: (id) => request(`/api/action-type/${id}`, { method: 'DELETE' }),

  // Admin Companies
  createCompany: (data) => request('/api/company/admin/register', { method: 'POST', body: JSON.stringify(data) }),

  // Admin Users (detailed)
  getAllUsersDetailed: () => request('/api/admin/users'),
  getUsersWithoutPerson: () => request('/api/admin/users/without-person'),
  changePassword: (userId, data) => request(`/api/admin/users/${userId}/password`, { method: 'PUT', body: JSON.stringify(data) }),
  updateUserRoles: (userId, data) => request(`/api/admin/users/${userId}/roles`, { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Persons
  createPersonForUser: (userId, data) => request(`/api/person/admin/${userId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Document Types
  createDocType: (data) => request('/api/document-type/create', { method: 'POST', body: JSON.stringify(data) }),
  getAllDocTypes: () => request('/api/document-type/all'),
  getDocTypeById: (id) => request(`/api/document-type/${id}`),
  updateDocType: (id, data) => request(`/api/document-type/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDocType: (id) => request(`/api/document-type/${id}`, { method: 'DELETE' }),

  // Departments & Municipalities
  getAllDepartments: () => request('/api/department/all'),
  getDepartmentById: (id) => request(`/api/department/${id}`),
  getAllMunicipalities: () => request('/api/municipality/all'),
  getMunicipalityById: (id) => request(`/api/municipality/${id}`),
  getMunicipalitiesByDepartment: (departmentId) => request(`/api/municipality/by-department/${departmentId}`),

  // Contacts
  getAllContacts: () => request('/api/contact/all'),
  createContact: (data) => request('/api/contact/create', { method: 'POST', body: JSON.stringify(data) }),
  getContactById: (id) => request(`/api/contact/${id}`),
  updateContact: (id, data) => request(`/api/contact/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id) => request(`/api/contact/${id}`, { method: 'DELETE' }),
};
