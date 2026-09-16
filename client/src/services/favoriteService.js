import api from './api';

export const favoriteService = {
  getAll: () => api.get('/favorites'),
  toggle: (donationId) => api.post(`/favorites/${donationId}`),
};
