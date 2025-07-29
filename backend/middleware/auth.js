// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Protect routes by verifying a JWT from an HttpOnly cookie (or Authorization header).
 */
export function authenticate(req, res, next) {
  try {
    // 1) Extract token
    const token =
      // prefer the cookie
      req.cookies?.token ||
      // fallback to header: "Authorization: Bearer <token>"
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 2) Verify token
    const payload = jwt.verify(token, JWT_SECRET);
    // payload should include { id: userId } as per your authController

    // 3) Attach to req and continue
    req.user = { id: payload.id };
    next();

  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}


