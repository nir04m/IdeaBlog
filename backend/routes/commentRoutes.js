// backend/routes/commentRoutes.js
import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';

const router = Router({ mergeParams: true });

// validation for comment content
const commentSchema = Joi.object({
  content: Joi.string().min(1).required()
});

// list comments (public)
router.get('/', getCommentsByPost);

// add, update, delete require auth
router.post(
  '/',
  authenticate,
  validateBody(commentSchema),
  createComment
);
router.put(
  '/:id',
  authenticate,
  validateBody(commentSchema),
  updateComment
);
router.delete(
  '/:id',
  authenticate,
  deleteComment
);

export default router;

