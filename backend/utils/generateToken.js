// backend/utils/generateToken.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_SECRET   = process.env.ACCESS_TOKEN_SECRET  || process.env.JWT_SECRET;
const DEFAULT_EXPIRY   = process.env.ACCESS_EXPIRES_IN    || '1h';

/**
 * Sign a JWT.
 * @param {Object} payload       – The payload to sign.
 * @param {string} [expiresIn]   – How long before the token expires.
 * @param {string} [secret]      – Secret to use (defaults to ACCESS_TOKEN_SECRET).
 */
export function generateToken(
  payload,
  expiresIn = DEFAULT_EXPIRY,
  secret    = DEFAULT_SECRET
) {
  return jwt.sign(payload, secret, { expiresIn });
}
