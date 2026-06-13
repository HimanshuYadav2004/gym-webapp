import express from 'express';
import { body } from 'express-validator';
import { registerGymOwner, loginGymOwner, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

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

router.post('/register', registerValidation, registerGymOwner);
router.post('/login', loginValidation, loginGymOwner);
router.get('/profile', authMiddleware, getProfile);

export default router;
