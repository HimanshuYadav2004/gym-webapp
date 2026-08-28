import express from 'express';
import {
  getPlatformStats,
  getAllGyms,
  getGymById,
  updateGymLicense,
  getAuditLog
} from '../controllers/superAdminController.js';
import { identifyMiddleware, superAdminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(identifyMiddleware, superAdminMiddleware);

router.get('/stats', getPlatformStats);
router.get('/gyms', getAllGyms);
router.get('/gyms/:id', getGymById);
router.patch('/gyms/:id/license', updateGymLicense);
router.get('/audit-log', getAuditLog);

export default router;
