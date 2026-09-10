import { Router } from 'express';
import {
  getPickups,
  getPickupById,
  createPickup,
  assignVolunteer,
  markPickedUp,
  markDelivered,
} from '../controllers/pickupController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  assignPickupValidator,
  updatePickupStatusValidator,
} from '../validators/pickupValidator.js';

const router = Router();

router.get('/', authenticate, getPickups);
router.get('/:id', authenticate, getPickupById);

router.post(
  '/',
  authenticate,
  authorizeRoles('ngo', 'admin'),
  createPickup
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
  updatePickupStatusValidator,
  validateRequest,
  markPickedUp
);

router.patch(
  '/:id/delivered',
  authenticate,
  authorizeRoles('volunteer', 'admin'),
  updatePickupStatusValidator,
  validateRequest,
  markDelivered
);

export default router;
