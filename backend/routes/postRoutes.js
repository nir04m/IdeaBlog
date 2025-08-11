// backend/routes/postRoutes.js
import { Router } from 'express';
import Joi from 'joi';
import multer from 'multer';

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

import {
  uploadMedia,
  getMediaForPost,
  deleteMedia
} from '../controllers/mediaController.js';

const router = Router();

// -------- validation for create/update ----------
const postSchema = Joi.object({
  title:      Joi.string().max(255).required(),
  content:    Joi.string().allow('', null),
  imageUrl:   Joi.string().uri().allow('', null),
  categoryId: Joi.number().integer().required(),
  tagIds:     Joi.array().items(Joi.number().integer()).optional().default([]),
});

// -------- multer in-memory so req.file.buffer exists ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB; tweak as needed
});

// ---------- routes ----------
router.get('/', getAllPosts);

// put specific/static routes BEFORE param routes
router.get('/user', authenticate, getMyPosts);

// media endpoints (field name must be "file")
router.post('/:postId/media', authenticate, upload.single('file'), uploadMedia);
router.get('/:postId/media', authenticate, getMediaForPost);
router.delete('/media/:id', authenticate, deleteMedia);

// param route AFTER the above to avoid catching "user" or "media"
router.get('/:id', getPostById);

router.post('/', authenticate, validateBody(postSchema), createPost);
router.put('/:id', authenticate, validateBody(postSchema), updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;
