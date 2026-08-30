import express from 'express';
import { body } from 'express-validator';
import {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTodayAttendance,
  getAttendanceReport
} from '../controllers/attendanceController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkin', authMiddleware, body('memberId').notEmpty(), checkIn);
router.post('/checkout', authMiddleware, body('attendanceId').notEmpty(), checkOut);
router.get('/today', authMiddleware, getTodayAttendance);
// Must come before /:memberId — otherwise Express matches "report" as a memberId
router.get('/report', authMiddleware, getAttendanceReport);
router.get('/:memberId', authMiddleware, getAttendanceHistory);

export default router;
