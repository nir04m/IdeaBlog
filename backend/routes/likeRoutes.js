// backend/routes/likeRoutes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createLike,
  deleteLike,
  getLikeStatus
} from '../controllers/likeController.js';

const router = Router({ mergeParams: true });

// anyone (even guests) can view count; auth optional for liked status
router.get('/', authenticate, getLikeStatus);

// only authenticated users can like/unlike
router.post('/', authenticate, createLike);
router.delete('/', authenticate, deleteLike);

export default router;
