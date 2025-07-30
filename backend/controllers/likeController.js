// backend/controllers/likeController.js
import Like from '../models/Like.js';
import Post from '../models/Post.js';

/** POST /api/posts/:postId/likes */
export const createLike = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;

    // verify post exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await Like.add({ postId, userId });
    const count = await Like.countForPost(postId);
    res.status(201).json({ message: 'Liked', count });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/posts/:postId/likes */
export const deleteLike = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;

    const removed = await Like.remove({ postId, userId });
    if (!removed) return res.status(404).json({ error: 'Like not found' });

    const count = await Like.countForPost(postId);
    res.json({ message: 'Unliked', count });
  } catch (err) {
    next(err);
  }
};

/** GET /api/posts/:postId/likes */
export const getLikeStatus = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user?.id || null;
    const count = await Like.countForPost(postId);
    const liked = userId ? await Like.exists({ postId, userId }) : false;
    res.json({ count, liked });
  } catch (err) {
    next(err);
  }
};


