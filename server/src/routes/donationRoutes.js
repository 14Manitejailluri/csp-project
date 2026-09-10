import { Router } from 'express';
import {
  createDonation,
  getAllDonations,
  getAvailableDonations,
  getDonationById,
  updateDonation,
  cancelDonation,
  deleteDonation,
} from '../controllers/donationController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  createDonationValidator,
  updateDonationValidator,
  nearbyDonationsValidator,
} from '../validators/donationValidator.js';

const router = Router();

// Public / Authenticated available listings search
router.get('/available', authenticate, nearbyDonationsValidator, validateRequest, getAvailableDonations);

// General listings
router.get('/', authenticate, getAllDonations);

router.post(
  '/',
  authenticate,
  authorizeRoles('donor', 'admin'),
  uploadSingleImage,
  createDonationValidator,
  validateRequest,
  createDonation
);

router.get('/:id', authenticate, getDonationById);

router.patch(
  '/:id',
  authenticate,
  authorizeRoles('donor', 'admin'),
  updateDonationValidator,
  validateRequest,
  updateDonation
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorizeRoles('donor', 'admin'),
  cancelDonation
);


router.delete(
  '/:id',
  authenticate,
  authorizeRoles('donor', 'admin'),
  deleteDonation
);

export default router;