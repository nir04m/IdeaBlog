// backend/routes/postRoutes.js
import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost
} from '../controllers/postController.js';

const router = Router();

// Validation schema for creating/updating posts
const postSchema = Joi.object({
  title:      Joi.string().max(255).required(),
  content:    Joi.string().allow('', null),
  imageUrl:   Joi.string().uri().allow('', null),
  categoryId: Joi.number().integer().required(),
  tagIds:     Joi.array()
                   .items(Joi.number().integer())
                   .optional()
                   .default([])
});


router.get('/',    getAllPosts);
router.get('/:id', getPostById);

// protected
router.post('/',      authenticate, validateBody(postSchema), createPost);
router.get('/user',   authenticate, getMyPosts);    // before /:id
router.put('/:id',    authenticate, validateBody(postSchema), updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;




