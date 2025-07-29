// backend/controllers/categoryController.js
import Category from '../models/Category.js';

/** POST /api/categories */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const id = await Category.create({ name, description });
    res.status(201).json({ message: 'Category created', category: await Category.findById(id) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/categories */
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

/** GET /api/categories/:id */
export const getCategoryById = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json({ category: cat });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/categories/:id */
export const updateCategory = async (req, res, next) => {
  try {
    const success = await Category.update(req.params.id, req.body);
    if (!success) return res.status(400).json({ error: 'Update failed' });
    res.json({ message: 'Category updated', category: await Category.findById(req.params.id) });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/categories/:id */
export const deleteCategory = async (req, res, next) => {
  try {
    const success = await Category.delete(req.params.id);
    if (!success) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};


