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

export const authService = {
  login: (email, password) => api.post('/auth/jwt/create/', { email, password }),
  register: (userData) => api.post('/auth/users/', userData),
  getProfile: () => api.get('/auth/users/me/'),
  updateProfile: (data) => api.patch('/auth/users/me/', data),
  changePassword: (passwords) => api.post('/auth/users/set_password/', passwords),
  refreshToken: (refresh) => api.post('/auth/jwt/refresh/', { refresh }),
};

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
    getAll: () => api.get('/groups/'),
    getById: (id) => api.get(`/groups/${id}/`),
    create: (data) => api.post('/groups/', data),
    update: (id, data) => api.patch(`/groups/${id}/`, data),
    delete: (id) => api.delete(`/groups/${id}/`),
    setPermissions: (id, permissions) => api.post(`/groups/${id}/set_permissions/`, { permissions })
};

export const permissionService = {
  getAll: () => api.get('/permissions/'),
};

export default api;