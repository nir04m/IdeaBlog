// backend/routes/postRoutes.js
import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} from '../controllers/postController.js';

const router = Router();

// Validation schema for updating posts
const postSchema = Joi.object({
  title:      Joi.string().max(255).required(),
  content:    Joi.string().allow('', null),
  imageUrl:   Joi.string().uri().allow('', null),
  categoryId: Joi.number().integer().required()
});

// Public reads
router.get('/',    getAllPosts);
router.get('/:id', getPostById);

// Protected writes (only owner enforced in controller)
router.put('/:id', authenticate, validateBody(postSchema), updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;


