import api from './api';

export const reportService = {
  create: (data) => api.post('/reports', data),
  getAll: (params) => api.get('/reports', { params }),
  resolve: (id, data) => api.patch(`/reports/${id}/resolve`, data),
};
