// backend/routes/mediaRoutes.js
import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
  uploadMedia,
  getMediaForPost,
  deleteMedia
} from '../controllers/mediaController.js';

const router = Router({ mergeParams: true });

// switch to memory storage for buffers
const upload = multer({ storage: multer.memoryStorage() });

// public listing
router.get('/', getMediaForPost);

// protected upload/delete
router.post('/', authenticate, upload.single('file'), uploadMedia);
router.delete('/:id', authenticate, deleteMedia);


export default router;
