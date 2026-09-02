import express from 'express';
import {
  getPlatformStats,
  getAllGyms,
  getGymById,
  updateGymLicense,
  updateGymPricing,
  getMemberDetail,
  getAuditLog
} from '../controllers/superAdminController.js';
import { identifyMiddleware, superAdminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(identifyMiddleware, superAdminMiddleware);

router.get('/stats', getPlatformStats);
router.get('/gyms', getAllGyms);
router.get('/gyms/:id', getGymById);
router.patch('/gyms/:id/license', updateGymLicense);
router.patch('/gyms/:id/pricing', updateGymPricing);
router.get('/members/:id', getMemberDetail);
router.get('/audit-log', getAuditLog);

export default router;
