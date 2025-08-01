// backend/server.js
import express       from 'express';
import dotenv        from 'dotenv';
import cookieParser  from 'cookie-parser';
import helmet        from 'helmet';
import cors          from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean      from 'xss-clean';
import morgan        from 'morgan';
import './config/env.js';
import logger        from './utils/logger.js';
import authRoutes    from './routes/authRoutes.js';
import userRoutes    from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import tagRoutes     from './routes/tagRoutes.js';
import userPostsRoutes from './routes/userPostsRoutes.js';
import postRoutes    from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes    from './routes/likeRoutes.js';
import mediaRoutes   from './routes/mediaRoutes.js';

import { apiLimiter }   from './middleware/rateLimiter.js';
import errorHandler     from './middleware/errorHandler.js';

dotenv.config();
const app = express();

// Security & sanitization
app.use(helmet());
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xssClean());

// Request logging
app.use(morgan('combined', {
  stream: { write: msg => logger.info(msg.trim()) }
}));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/user', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users/:userId/posts', userPostsRoutes);
app.use('/api/posts/:postId/comments', commentRoutes);
app.use('/api/posts/:postId/likes', likeRoutes);
app.use('/api/posts/:postId/media', mediaRoutes);

// Error handler (must come last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info('Server listening on http://localhost:%d', PORT);
});



