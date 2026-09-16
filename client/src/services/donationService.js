import api from './api';

export const donationService = {
  getAll: (params) => api.get('/donations', { params }),
  getAvailable: (params) => api.get('/donations/available', { params }),
  getNearby: (params) => api.get('/donations/available', { params }),
  getById: (id) => api.get(`/donations/${id}`),
  create: (formData) =>
    api.post('/donations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/donations/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  cancel: (id) => api.patch(`/donations/${id}/cancel`),
  myDonations: (params) => api.get('/donations', { params }),
  myClaimed: (params) => api.get('/claims', { params }),
  claim: (donationId, notes = '') => api.post('/claims', { donationId, notes }),
};
