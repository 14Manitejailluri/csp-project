import { Router } from 'express';
import {
  claimDonation,
  getClaims,
  getClaimById,
} from '../controllers/claimController.js';
import { authenticate, authorizeRoles, requireVerifiedNgo } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createClaimValidator, claimParamValidator } from '../validators/claimValidator.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorizeRoles('ngo', 'admin'),
  requireVerifiedNgo,
  createClaimValidator,
  validateRequest,
  claimDonation
);

router.get(
  '/',
  authenticate,
  authorizeRoles('ngo', 'admin'),
  getClaims
);

router.get(
  '/:id',
  authenticate,
  authorizeRoles('ngo', 'admin'),
  claimParamValidator,
  validateRequest,
  getClaimById
);

export default router;
