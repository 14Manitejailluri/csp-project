import { Router } from 'express';
import { getMe, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/users/profile  - Get current user's profile
router.get('/profile', authenticate, getMe);

// PUT /api/users/profile  - Update current user's profile
router.put('/profile', authenticate, updateProfile);

export default router;
