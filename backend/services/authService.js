// backend/services/authService.js
import bcrypt from 'bcrypt';
import jwt    from 'jsonwebtoken';
import dotenv from 'dotenv';
import User   from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendVerificationEmail } from './emailService.js';

dotenv.config();

const ACCESS_SECRET   = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET  = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_EXPIRES  = process.env.ACCESS_EXPIRES_IN;
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES_IN;

/**
 * Register a new user, hash password, save to DB, send verification email.
 * @param {{username:string,email:string,password:string}} data
 * @returns {Promise<{user, accessToken, refreshToken}>}
 */
export async function registerUser({ username, email, password }) {
  if (await User.findByEmail(email)) {
    throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
  }
  if (await User.findByUsername(username)) {
    throw Object.assign(new Error('Username already taken'), { statusCode: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const userId = await User.create({ username, email, passwordHash });
  const user = await User.findById(userId);

  // issue tokens
  const accessToken  = generateToken({ id: userId }, ACCESS_EXPIRES, ACCESS_SECRET);
  const refreshToken = generateToken({ id: userId }, REFRESH_EXPIRES, REFRESH_SECRET);

  // send welcome/verification email (optional)
  await sendVerificationEmail({ to: email, name: username, token: refreshToken });

  return { user, accessToken, refreshToken };
}

/**
 * Authenticate existing user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user, accessToken, refreshToken}>}
 */
export async function loginUser(email, password) {
  const user = await User.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }
  const accessToken  = generateToken({ id: user.id }, ACCESS_EXPIRES, ACCESS_SECRET);
  const refreshToken = generateToken({ id: user.id }, REFRESH_EXPIRES, REFRESH_SECRET);
  return { user, accessToken, refreshToken };
}

/**
 * Verify a refresh token and issue a new access token.
 * @param {string} token
 * @returns {Promise<string>} new access token
 */
export async function refreshAccessToken(token) {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const newAccess = generateToken({ id: payload.id }, ACCESS_EXPIRES, ACCESS_SECRET);
    return newAccess;
  } catch (err) {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
  }
}


