import { Router } from 'express';
import { registerCustomer, sendOtp, verifyOtp } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', protect, registerCustomer);

export default router;