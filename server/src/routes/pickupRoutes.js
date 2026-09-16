import { Router } from 'express';
import {
  getPickups,
  getPickupById,
  createPickup,
  assignVolunteer,
  generatePickupQR,
  verifyPickupQR,
  markPickedUp,
  markDelivered,
  confirmReceipt,
  getCertificateData,
} from '../controllers/pickupController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  assignPickupValidator,
} from '../validators/pickupValidator.js';

const router = Router();

router.get('/', authenticate, getPickups);
router.get('/:id', authenticate, getPickupById);
router.get('/:id/certificate', authenticate, getCertificateData);

router.post(
  '/',
  authenticate,
  authorizeRoles('ngo', 'admin'),
  createPickup
);

router.post(
  '/:id/generate-qr',
  authenticate,
  authorizeRoles('donor', 'ngo', 'admin'),
  generatePickupQR
);

router.post(
  '/:id/verify-qr',
  authenticate,
  authorizeRoles('volunteer', 'admin'),
  verifyPickupQR
);

router.patch(
  '/:id/assign',
  authenticate,
  authorizeRoles('volunteer', 'ngo', 'admin'),
  assignPickupValidator,
  validateRequest,
  assignVolunteer
);

router.patch(
  '/:id/picked-up',
  authenticate,
  authorizeRoles('volunteer', 'admin'),
  markPickedUp
);

router.patch(
  '/:id/delivered',
  authenticate,
  authorizeRoles('volunteer', 'admin'),
  markDelivered
);

router.patch(
  '/:id/confirm-receipt',
  authenticate,
  authorizeRoles('ngo', 'admin'),
  confirmReceipt
);

export default router;

