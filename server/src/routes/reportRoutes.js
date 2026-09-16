import { Router } from 'express';
import { createReport, getReports, resolveReport } from '../controllers/reportController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createReport);
router.get('/', authenticate, authorizeRoles('admin'), getReports);
router.patch('/:id/resolve', authenticate, authorizeRoles('admin'), resolveReport);

export default router;
