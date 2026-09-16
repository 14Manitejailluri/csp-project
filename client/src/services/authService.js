import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get("/api/auth/me", {
  withCredentials: true,
}),,
  updateProfile: (data) => api.put('/auth/profile', data),
};
