import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const MAX_ATTEMPTS = 5;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOTP(otp) {
  return bcrypt.hash(otp, 10);
}

async function verifyOTPHash(otp, hash) {
  return bcrypt.compare(otp, hash);
}

function isValidPhoneNumber(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

async function sendOTP(phoneNumber) {
  if (!isValidPhoneNumber(phoneNumber)) {
    throw { status: 400, message: 'Invalid mobile number. Must be a 10-digit Indian number starting with 6-9.' };
  }

  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.oTP.deleteMany({ where: { phoneNumber } });

  await prisma.oTP.create({
    data: { phoneNumber, otpHash, expiresAt, attempts: 0 },
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`Development OTP for ${phoneNumber}: ${otp}`);
  }

  // Future: integrate Twilio/SMS provider here
  // await smsProvider.send(phoneNumber, `Your DogWatch OTP is: ${otp}`);

  return { success: true, message: 'OTP sent successfully' };
}

async function verifyOTP(phoneNumber, otp) {
  if (!isValidPhoneNumber(phoneNumber)) {
    throw { status: 400, message: 'Invalid mobile number' };
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    throw { status: 400, message: 'Invalid OTP. Must be a 6-digit number.' };
  }

  const otpRecord = await prisma.oTP.findFirst({
    where: { phoneNumber },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    throw { status: 400, message: 'No OTP found. Please request a new OTP.' };
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    throw { status: 429, message: 'Too many OTP attempts. Please request a new OTP.' };
  }

  if (new Date() > otpRecord.expiresAt) {
    throw { status: 400, message: 'OTP has expired. Please request a new OTP.' };
  }

  const isValid = await verifyOTPHash(otp, otpRecord.otpHash);

  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { attempts: otpRecord.attempts + 1 },
  });

  if (!isValid) {
    throw { status: 400, message: 'Invalid OTP. Please try again.' };
  }

  await prisma.oTP.delete({ where: { id: otpRecord.id } });

  return true;
}

export { sendOTP, verifyOTP, isValidPhoneNumber };
