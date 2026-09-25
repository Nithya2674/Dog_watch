import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isVerified) {
      return res.status(401).json({ message: 'Unauthorized. User not found or not verified.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
    }
    next(error);
  }
}

export default authMiddleware;
