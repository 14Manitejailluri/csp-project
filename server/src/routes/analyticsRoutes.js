import { Router } from 'express';
import {
  getDonorAnalytics,
  getNgoAnalytics,
  getVolunteerAnalytics,
  getAdminAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get(
  '/donor',
  authenticate,
  authorizeRoles('donor', 'admin'),
  getDonorAnalytics
);

router.get(
  '/ngo',
  authenticate,
  authorizeRoles('ngo', 'admin'),
  getNgoAnalytics
);

router.get(
  '/volunteer',
  authenticate,
  authorizeRoles('volunteer', 'admin'),
  getVolunteerAnalytics
);

router.get(
  '/admin',
  authenticate,
  authorizeRoles('admin'),
  getAdminAnalytics
);

export default router;
