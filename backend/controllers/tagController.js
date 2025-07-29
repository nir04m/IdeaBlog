// backend/controllers/tagController.js
import Tag from '../models/Tag.js';

/** POST /api/tags */
export const createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    const id = await Tag.create({ name });
    const tag = await Tag.findById(id);
    res.status(201).json({ message: 'Tag created', tag });
  } catch (err) {
    next(err);
  }
};

/** GET /api/tags */
export const getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.findAll();
    res.json({ tags });
  } catch (err) {
    next(err);
  }
};

/** GET /api/tags/:id */
export const getTagById = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    res.json({ tag });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/tags/:id */
export const updateTag = async (req, res, next) => {
  try {
    const success = await Tag.update(req.params.id, req.body);
    if (!success) return res.status(400).json({ error: 'Update failed' });
    const updated = await Tag.findById(req.params.id);
    res.json({ message: 'Tag updated', tag: updated });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/tags/:id */
export const deleteTag = async (req, res, next) => {
  try {
    const success = await Tag.delete(req.params.id);
    if (!success) return res.status(404).json({ error: 'Tag not found' });
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    next(err);
  }
};


