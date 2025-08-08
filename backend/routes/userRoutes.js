// backend/routes/userRoutes.js
import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { 
  getProfile, 
  updateProfile ,
  uploadAvatar,
  deleteAvatar
} from '../controllers/userController.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Validation schema for profile updates
const profileSchema = Joi.object({
  username:       Joi.string().alphanum().min(3).max(30),
  bio:            Joi.string().allow('', null),
  profilePicture: Joi.string().uri().allow('', null)
});

router.get('/', authenticate, getProfile);
router.put('/', authenticate, validateBody(profileSchema), updateProfile);

// POST /api/media/avatar
router.post(
  '/avatar',
   authenticate,
   upload.single('file'),
   uploadAvatar
);

// (optionally) DELETE /api/media/avatar
router.delete(
  '/avatar',
  authenticate,
  deleteAvatar
);

export default router;

