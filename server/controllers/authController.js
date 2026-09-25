import { PrismaClient } from '@prisma/client';
import { sendOTP, verifyOTP } from '../services/otpService.js';
import { generateToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

async function sendOtpHandler(req, res, next) {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const result = await sendOTP(phoneNumber);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
}

async function verifyOtpHandler(req, res, next) {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    await verifyOTP(phoneNumber, otp);

    let user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      user = await prisma.user.create({
        data: { phoneNumber, isVerified: true, role: 'USER' },
      });
    } else {
      user = await prisma.user.update({
        where: { phoneNumber },
        data: { isVerified: true },
      });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
}

async function getMeHandler(req, res, next) {
  try {
    res.json({
      id: req.user.id,
      phoneNumber: req.user.phoneNumber,
      role: req.user.role,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    next(error);
  }
}

export { sendOtpHandler, verifyOtpHandler, getMeHandler };
