import express from 'express';
import { body } from 'express-validator';
import {
  createMembership,
  renewMembership,
  getMembershipHistory
} from '../controllers/membershipController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Validation
const membershipValidation = [
  body('memberId').notEmpty(),
  body('planName').notEmpty(),
  body('planDuration').isInt({ min: 1 }),
  body('planAmount').isFloat({ min: 0 })
];

router.post('/', authMiddleware, membershipValidation, createMembership);
router.post('/renew', authMiddleware, membershipValidation, renewMembership);
router.get('/:memberId', authMiddleware, getMembershipHistory);

export default router;
