// backend/routes/tagRoutes.js
import { Router } from 'express';
import Joi from 'joi';
import { validateBody } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/authorize.js';
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag
} from '../controllers/tagController.js';

const router = Router();

const tagSchema = Joi.object({
  name: Joi.string().max(50).required()
});

// Public reads
router.get('/', getAllTags);
router.get('/:id', getTagById);

// Any authenticated user can create or update
router.post('/', authenticate, validateBody(tagSchema), createTag);
router.put(
  '/:id',
  authenticate,
  validateBody(tagSchema),
  updateTag
);

// Only admins can delete
router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  deleteTag
);

export default router;


