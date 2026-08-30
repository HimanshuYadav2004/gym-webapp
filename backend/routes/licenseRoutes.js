import express from 'express';
import {
  getMyLicense,
  createRenewalOrder,
  verifyRenewalPayment,
  razorpayWebhook
} from '../controllers/licenseController.js';
import { identifyMiddleware } from '../middleware/auth.js';
import { paymentLimiter, webhookLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// identifyMiddleware (not authMiddleware) — an expired account must still be
// able to see its own status and pay to renew.
router.get('/', identifyMiddleware, getMyLicense);
router.post('/order', identifyMiddleware, paymentLimiter, createRenewalOrder);
router.post('/verify', identifyMiddleware, paymentLimiter, verifyRenewalPayment);

// Called by Razorpay's servers, not the browser — no auth header to identify.
// Authenticity comes from the HMAC signature check inside the handler.
router.post('/webhook', webhookLimiter, razorpayWebhook);

export default router;
