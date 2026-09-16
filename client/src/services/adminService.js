import api from './api';

export const adminService = {
  getUsers: (params) => api.get('/admin/users', { params }),
  verifyNgo: (id, isVerified = true) => api.patch(`/admin/users/${id}/verify`, { isVerified }),
  toggleUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/suspend`, { isActive }),
  getDonations: (params) => api.get('/admin/donations', { params }),
  verifyDonation: (id) => api.patch(`/admin/donations/${id}/verify`),
  rejectDonation: (id, reason) => api.patch(`/admin/donations/${id}/reject`, { reason }),
  getReports: () => api.get('/admin/reports'),
};

