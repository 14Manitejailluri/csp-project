import { Router } from 'express';
import {
  getUsers,
  verifyNgo,
  toggleUserStatus,
  getAdminDonations,
  getReports,
  verifyDonation,
  rejectDonation,
} from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { userParamValidator } from '../validators/userValidator.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = Router();

// Protect all admin routes with admin authorization
router.use(authenticate, authorizeRoles('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/verify', userParamValidator, validateRequest, verifyNgo);
router.patch('/users/:id/suspend', userParamValidator, validateRequest, toggleUserStatus);
router.get('/donations', getAdminDonations);
router.patch('/donations/:id/verify', verifyDonation);
router.patch('/donations/:id/reject', rejectDonation);
router.get('/reports', getReports);

export default router;

