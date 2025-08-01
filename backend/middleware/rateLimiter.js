// backend/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';
import dotenv    from 'dotenv';

dotenv.config();

export const apiLimiter = rateLimit({
  windowMs:   15 * 60 * 1000,             // 15 minutes
  max:        Number(process.env.RATE_LIMIT_MAX)   || 100, // limit each IP
  message:    {
    error:   'Too many requests, please try again later'
  },
  standardHeaders: true,                  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders:   false                  // Disable the `X-RateLimit-*` headers
});
