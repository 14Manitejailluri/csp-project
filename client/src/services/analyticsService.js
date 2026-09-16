import api from './api';

export const analyticsService = {
  getDonor: () => api.get('/analytics/donor'),
  getNgo: () => api.get('/analytics/ngo'),
  getVolunteer: () => api.get('/analytics/volunteer'),
  getAdmin: () => api.get('/analytics/admin'),
  getPlatform: () => api.get('/analytics/admin'), // alias used by AdminDashboard
};
