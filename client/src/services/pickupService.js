import api from './api';

export const pickupService = {
  getAll: (params) => api.get('/pickups', { params }),
  getAvailable: (params) => api.get('/pickups', { params: { ...params, availableOnly: 'true' } }),
  myPickups: (params) => api.get('/pickups', { params }),
  getById: (id) => api.get(`/pickups/${id}`),
  create: (data) => api.post('/pickups', data),
  accept: (id) => api.patch(`/pickups/${id}/assign`),
  assignVolunteer: (id, data = {}) => api.patch(`/pickups/${id}/assign`, data),
  generateQR: (id) => api.post(`/pickups/${id}/generate-qr`),
  verifyQR: (id, data) => api.post(`/pickups/${id}/verify-qr`, data),
  markPickedUp: (id, data = {}) => api.patch(`/pickups/${id}/picked-up`, data),
  markDelivered: (id, data = {}) => api.patch(`/pickups/${id}/delivered`, data),
  confirmReceipt: (id) => api.patch(`/pickups/${id}/confirm-receipt`),
  getCertificate: (id) => api.get(`/pickups/${id}/certificate`),
};

