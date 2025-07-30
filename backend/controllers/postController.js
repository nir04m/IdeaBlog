// backend/controllers/postController.js
import Post from '../models/Post.js';
import PostCategory from '../models/PostCategory.js';
import PostTag      from '../models/PostTag.js';

/**
 * POST /api/users/:userId/posts
 */
export const createPost = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, content, imageUrl, categoryId, tagIds = [] } = req.body;
    const postId = await Post.create({ userId, title, content, imageUrl, categoryId, tagIds });

    // manage join-tables
    if (categoryId) {
      await PostCategory.add({ postId, categoryId });
    }
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
 * GET /api/posts/:id
 * Retrieve a single post by its ID
 */
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:userId/posts
 * Retrieve all posts for a specific user
 */
export const getPostsByUser = async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.userId);
    if (req.user.id !== targetUserId) {
      return res.status(403).json({ error: "Forbidden to view another user's posts" });
    }
    const posts = await Post.findByUser(targetUserId);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/posts/:id
 */
export const updatePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const existing = await Post.findById(postId);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, content, imageUrl, categoryId, tagIds = [] } = req.body;
    const changed = await Post.update(postId, { title, content, imageUrl, categoryId });
    if (!changed) {
      return res.status(400).json({ error: 'No changes or update failed' });
    }

    // reset join-tables
    await PostCategory.clearByPost(postId);
    if (categoryId) {
      await PostCategory.add({ postId, categoryId });
    }

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
 */
export const deletePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const existing = await Post.findById(postId);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // clear join-tables (optional; cascade may handle it)
    await PostCategory.clearByPost(postId);
    await PostTag.clearByPost(postId);

    await Post.delete(postId);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};


