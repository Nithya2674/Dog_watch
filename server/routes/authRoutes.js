import express from 'express';
import { sendOtpHandler, verifyOtpHandler, getMeHandler } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
router.get('/me', authMiddleware, getMeHandler);

export default router;
