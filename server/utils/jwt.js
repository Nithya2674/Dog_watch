import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export { generateToken, verifyToken };
