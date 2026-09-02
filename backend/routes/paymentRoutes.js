import express from 'express';
import { body } from 'express-validator';
import {
  createPayment,
  getPaymentHistory,
  getAllPayments,
  updatePayment,
  deletePayment
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Validation
const paymentValidation = [
  body('memberId').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('paymentMethod').notEmpty()
];

router.post('/', authMiddleware, paymentValidation, createPayment);
router.get('/all', authMiddleware, getAllPayments);
router.put('/:id', authMiddleware, updatePayment);
router.delete('/:id', authMiddleware, deletePayment);
router.get('/:memberId', authMiddleware, getPaymentHistory);

export default router;
