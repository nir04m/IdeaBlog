// backend/routes/categoryRoutes.js
import { Router } from 'express';
import { authenticate }    from '../middleware/auth.js';
import { authorizeAdmin }  from '../middleware/authorize.js';
import { validateBody }    from '../middleware/validate.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById
} from '../controllers/categoryController.js';
import Joi from 'joi';

const router = Router();
const schema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().allow('', null)
});

// public reads
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// admin-only writes
router.post('/',    authenticate, authorizeAdmin, validateBody(schema), createCategory);
router.put('/:id',   authenticate, authorizeAdmin, validateBody(schema), updateCategory);
router.delete('/:id',authenticate, authorizeAdmin,                  deleteCategory);

export default router;



