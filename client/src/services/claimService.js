import api from './api';

export const claimService = {
  create: (data) => api.post('/claims', data),
  getAll: () => api.get('/claims'),
  getById: (id) => api.get(`/claims/${id}`),
};
