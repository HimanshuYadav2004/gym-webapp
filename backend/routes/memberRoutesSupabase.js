import express from 'express';
import { body } from 'express-validator';
import {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember
} from '../controllers/memberControllerSupabase.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadMemory } from '../middleware/uploadSupabase.js';

const router = express.Router();

// Validation
const memberValidation = [
  body('fullName').notEmpty().trim(),
  body('phoneNumber').notEmpty(),
  body('email').optional().isEmail().normalizeEmail()
];

router.post('/', authMiddleware, uploadMemory.single('photo'), memberValidation, createMember);
router.get('/', authMiddleware, getAllMembers);
router.get('/:id', authMiddleware, getMemberById);
router.put('/:id', authMiddleware, uploadMemory.single('photo'), updateMember);
router.delete('/:id', authMiddleware, deleteMember);

export default router;
