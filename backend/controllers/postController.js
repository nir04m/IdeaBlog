// backend/controllers/postController.js
import Post         from '../models/Post.js';
import PostCategory from '../models/PostCategory.js';
import PostTag      from '../models/PostTag.js';

/**
 * POST /api/posts
 * Create a new post for the authenticated user
 */
export const createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, content, imageUrl, categoryId, tagIds = [] } = req.body;

    const postId = await Post.create({ userId, title, content, imageUrl, categoryId, tagIds });

    // category (single FK + join table)
    if (categoryId) {
      await PostCategory.add({ postId, categoryId });
    }
    // tags (many-to-many)
    await PostTag.clearByPost(postId);
    if (Array.isArray(tagIds)) {
      await Promise.all(tagIds.map(tagId =>
        PostTag.add({ postId, tagId })
      ));
    }

    const post = await Post.findById(postId);
    res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/posts
 * Retrieve all posts (public feed)
 */
export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.findAll();
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/posts/user
 * Retrieve all posts belonging to the authenticated user
 */
export const getMyPosts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const posts = await Post.findByUser(userId);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/posts/:id
 * Retrieve a single post by its ID
 */
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/posts/:id
 * Update a post (only owner)
 */
export const updatePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const existing = await Post.findById(postId);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Forbidden to update this post' });
    }

    const { title, content, imageUrl, categoryId, tagIds = [] } = req.body;
    const changed = await Post.update(postId, { title, content, imageUrl, categoryId, tagIds });
    if (!changed) {
      return res.status(400).json({ error: 'No changes or update failed' });
    }

    // sync join-tables
    await PostCategory.clearByPost(postId);
    if (categoryId) await PostCategory.add({ postId, categoryId });

    await PostTag.clearByPost(postId);
    if (Array.isArray(tagIds)) {
      await Promise.all(tagIds.map(tagId =>
        PostTag.add({ postId, tagId })
      ));
    }

    const post = await Post.findById(postId);
    res.json({ message: 'Post updated', post });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/posts/:id
 * Delete a post (only owner—cascades to join tables)
 */
export const deletePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const existing = await Post.findById(postId);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Forbidden to delete this post' });
    }

    // clear join-tables (cascades would also handle this)
    await PostCategory.clearByPost(postId);
    await PostTag.clearByPost(postId);

    await Post.delete(postId);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

export default { createPost, getAllPosts, getMyPosts, getPostById, updatePost, deletePost };