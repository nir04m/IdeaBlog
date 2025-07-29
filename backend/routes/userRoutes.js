import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { validateBody } from '../middleware/validate.js';
import Joi from 'joi';

const router = Router();
const profileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  bio: Joi.string().allow('', null),
  profilePicture: Joi.string().uri().allow('', null)
});

router.get( '/', authenticate, getProfile );
router.put( '/', authenticate, validateBody(profileSchema), updateProfile );

export default router;
