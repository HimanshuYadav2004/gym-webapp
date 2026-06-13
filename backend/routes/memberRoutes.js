import express from 'express';
import { body } from 'express-validator';
import {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember
} from '../controllers/memberController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Validation
const memberValidation = [
  body('fullName').notEmpty().trim(),
  body('phoneNumber').notEmpty(),
  body('email').optional().isEmail().normalizeEmail()
];

router.post('/', authMiddleware, upload.single('photo'), memberValidation, createMember);
router.get('/', authMiddleware, getAllMembers);
router.get('/:id', authMiddleware, getMemberById);
router.put('/:id', authMiddleware, upload.single('photo'), updateMember);
router.delete('/:id', authMiddleware, deleteMember);

export default router;
