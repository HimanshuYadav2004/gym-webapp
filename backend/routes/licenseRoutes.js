import express from 'express';
import { getMyLicense, renewLicense } from '../controllers/licenseController.js';
import { identifyMiddleware } from '../middleware/auth.js';

const router = express.Router();

// identifyMiddleware (not authMiddleware) — an expired account must still be
// able to see its own status and pay to renew.
router.get('/', identifyMiddleware, getMyLicense);
router.post('/renew', identifyMiddleware, renewLicense);

export default router;
