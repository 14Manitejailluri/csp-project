import api from './api';

export const pickupService = {
  getAll: (params) => api.get('/pickups', { params }),
  getById: (id) => api.get(`/pickups/${id}`),
  create: (data) => api.post('/pickups', data),
  assignVolunteer: (id, data = {}) => api.patch(`/pickups/${id}/assign`, data),
  markPickedUp: (id, data = {}) => api.patch(`/pickups/${id}/picked-up`, data),
  markDelivered: (id, data = {}) => api.patch(`/pickups/${id}/delivered`, data),
};
