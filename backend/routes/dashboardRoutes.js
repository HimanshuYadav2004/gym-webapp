import express from 'express';
import { getDashboardStats, getDueMembers, getRevenueTrend } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/due-members', authMiddleware, getDueMembers);
router.get('/revenue-trend', authMiddleware, getRevenueTrend);

export default router;
