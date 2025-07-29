// backend/routes/userRoutes.js
import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = Router();

// Validation schema for profile updates
const profileSchema = Joi.object({
  username:       Joi.string().alphanum().min(3).max(30),
  bio:            Joi.string().allow('', null),
  profilePicture: Joi.string().uri().allow('', null)
});

router.get('/', authenticate, getProfile);
router.put('/', authenticate, validateBody(profileSchema), updateProfile);

export default router;

