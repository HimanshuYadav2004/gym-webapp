import express from 'express';
import { getDashboardStats, getDueMembers } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/due-members', authMiddleware, getDueMembers);

export default router;
