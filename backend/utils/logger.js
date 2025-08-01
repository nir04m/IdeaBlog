// backend/utils/logger.js
import { createLogger, format, transports } from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    // Static label instead of filename or folder
    format.label({ label: 'console' }),
    // Include error stacks
    format.errors({ stack: true }),
    // Support %s, %d interpolation
    format.splat(),
    // Final output without timestamp
    format.printf(({ level, message, label, stack }) => {
      const msg = stack || message;
      return `[${label}] ${level}: ${msg}`;
    })
  ),
  defaultMeta: { service: 'backend' },
  transports: [
    new transports.Console()
  ],
});

export default logger;



