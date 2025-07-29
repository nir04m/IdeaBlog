// backend/routes/authRoutes.js
import { Router } from 'express';
import Joi from 'joi';
import { validateBody } from '../middleware/validate.js';
import { register, login, logout } from '../controllers/authController.js';

const router = Router();

//
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', validateBody(registerSchema), register);
router.post('/login',    validateBody(loginSchema),    login);
router.post('/logout',   logout);

export default router;

