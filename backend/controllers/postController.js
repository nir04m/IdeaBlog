// backend/controllers/postController.js
import Post         from '../models/Post.js';
import PostCategory from '../models/PostCategory.js';
import PostTag      from '../models/PostTag.js';
import Media from '../models/Media.js';
import { deleteFromR2 } from '../services/mediaService.js';

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


// helpers (same logic as avatar controller)
const isR2Host = (host) =>
  host.endsWith('.r2.dev') || host.endsWith('.r2.cloudflarestorage.com');

const extractR2Key = (url, bucket) => {
  const u = new URL(url);
  let key = u.pathname.replace(/^\/+/, ''); // drop leading slash
  // if using the S3 endpoint form: /<bucket>/media/uuid.jpg
  if (bucket && key.startsWith(`${bucket}/`)) {
    key = key.slice(bucket.length + 1);
  }
  return key; // e.g. "media/9d3b...jpg"
};

/**
 * PUT /api/posts/:id
 * Update a post (only owner)
 */
export const updatePost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const existing = await Post.findById(postId);
    if (!existing) return res.status(404).json({ error: 'Post not found' });
    if (req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Forbidden to update this post' });
    }

    const { title, content, imageUrl, categoryId, tagIds = [] } = req.body;

    // ✅ capture BEFORE update
    const oldUrl = existing.imageUrl || null;

    console.log('DB Old Image URL:', oldUrl);
    console.log('Incoming New Image URL:', imageUrl);

    // do the update
    const changed = await Post.update(postId, {
      title, content, imageUrl, categoryId, tagIds
    });
    if (!changed) return res.status(400).json({ error: 'No changes or update failed' });

    // delete only if actually changed
    if (oldUrl && imageUrl && oldUrl !== imageUrl) {
      try {
        const BUCKET = process.env.CF_R2_BUCKET;
        const u = new URL(oldUrl);
        if (isR2Host(u.host)) {
          const key = extractR2Key(oldUrl, BUCKET); // -> "media/<uuid>.<ext>"
          if (key.startsWith('media/')) {
            await deleteFromR2({ key });
          }
        }
        if (typeof Media.deleteByPostAndUrl === 'function') {
          await Media.deleteByPostAndUrl(postId, oldUrl).catch(() => {});
        }
      } catch (e) {
        console.warn('Best-effort old cover cleanup failed:', e?.message || e);
      }
    }

    // sync joins
    await PostCategory.clearByPost(postId);
    if (categoryId) await PostCategory.add({ postId, categoryId });
    await PostTag.clearByPost(postId);
    if (Array.isArray(tagIds)) {
      await Promise.all(tagIds.map(tagId => PostTag.add({ postId, tagId })));
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