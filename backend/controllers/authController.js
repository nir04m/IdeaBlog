// backend/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt    from 'jsonwebtoken';
import dotenv from 'dotenv';
import User   from '../models/User.js';

dotenv.config();
const ACCESS_TOKEN_SECRET  = process.env.ACCESS_TOKEN_SECRET  || process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES_IN    = process.env.ACCESS_EXPIRES_IN    || '1h';
const REFRESH_EXPIRES_IN   = process.env.REFRESH_EXPIRES_IN   || '7d';
const ACCESS_COOKIE_NAME   = 'accessToken';
const REFRESH_COOKIE_NAME  = 'refreshToken';

async function issueTokens(res, userId) {
  // create tokens
  const accessToken = jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN
  });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN
  });

  // set cookies
  res
    .cookie(ACCESS_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   1000 * 60 * 60               // 1 hour
    })
    .cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   1000 * 60 * 60 * 24 * 7      // 7 days
    });
}

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (await User.findByEmail(email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    if (await User.findByUsername(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await User.create({ username, email, passwordHash });

    await issueTokens(res, userId);
    res.status(201).json({ message: 'User registered', user: { id: userId, username, email } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await issueTokens(res, user.id);
    res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res
    .clearCookie(ACCESS_COOKIE_NAME, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path:     '/'
    })
    .clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path:     '/'
    })
    .json({ message: 'Logout successful' });
};



