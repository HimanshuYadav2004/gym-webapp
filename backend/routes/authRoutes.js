import express from 'express';
import { body } from 'express-validator';
import {
  registerGymOwner,
  loginGymOwner,
  getProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { handleValidationErrors } from '../middleware/validate.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  body('phoneNumber').notEmpty(),
  body('gymName').notEmpty().trim()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

router.post('/register', authLimiter, registerValidation, handleValidationErrors, registerGymOwner);
router.post('/login', authLimiter, loginValidation, handleValidationErrors, loginGymOwner);
router.post('/forgot-password', authLimiter, body('email').isEmail().normalizeEmail(), handleValidationErrors, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/profile', authMiddleware, getProfile);

export default router;
