import express from 'express';
import { getGymInfo, lookupMember, confirmCheckIn } from '../controllers/checkinController.js';
import { checkinLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// No authMiddleware — these are intentionally public, used by members' own phones
router.get('/gym/:gymOwnerId', getGymInfo);
router.post('/lookup', checkinLimiter, lookupMember);
router.post('/confirm', checkinLimiter, confirmCheckIn);

export default router;
