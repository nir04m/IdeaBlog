// backend/middleware/errorHandler.js
import logger from '../utils/logger.js';

export default function errorHandler(err, req, res, next) {
  // Log full error
  logger.error('%o', err);

  // If headers already sent, delegate
  if (res.headersSent) {
    return next(err);
  }

  // Default to 500
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ error: message });
}


