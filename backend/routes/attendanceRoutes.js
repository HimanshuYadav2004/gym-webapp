import express from 'express';
import { body } from 'express-validator';
import {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTodayAttendance
} from '../controllers/attendanceController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkin', authMiddleware, body('memberId').notEmpty(), checkIn);
router.post('/checkout', authMiddleware, body('attendanceId').notEmpty(), checkOut);
router.get('/today', authMiddleware, getTodayAttendance);
router.get('/:memberId', authMiddleware, getAttendanceHistory);

export default router;
