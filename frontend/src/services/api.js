import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const userService = {
  getAll: () => api.get('/users/'),
  getById: (id) => api.get(`/users/${id}/`),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
  setGroups: (id, groups) => api.post(`/users/${id}/set_groups/`, { groups }),
  setPermissions: (id, permissions) => api.post(`/users/${id}/set_permissions/`, { permissions })
};

export const groupService = {
  getAll: () => api.get('/users/groups/'),
  getById: (id) => api.get(`/users/groups/${id}/`),
  create: (data) => api.post('/users/groups/', data),
  update: (id, data) => api.patch(`/users/groups/${id}/`, data),
  delete: (id) => api.delete(`/users/groups/${id}/`),
  setPermissions: (id, permissions) => api.post(`/users/groups/${id}/set_permissions/`, { permissions })
};

export const permissionService = {
  getAll: () => api.get('/users/permissions/'),
};

export default api;