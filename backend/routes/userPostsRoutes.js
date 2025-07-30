// backend/routes/userPostsRoutes.js
import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  getMyPosts,
  createPost
} from '../controllers/postController.js';

const router = Router({ mergeParams: true });

// Validation schema for creating posts
const postSchema = Joi.object({
  title:      Joi.string().max(255).required(),
  content:    Joi.string().allow('', null),
  imageUrl:   Joi.string().uri().allow('', null),
  categoryId: Joi.number().integer().required()
});

// List & create for a specific user
router.get('/', authenticate, getMyPosts);
router.post('/', authenticate, validateBody(postSchema), createPost);

export default router;


