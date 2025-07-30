// backend/controllers/commentController.js
import Comment from '../models/Comment.js';
import Post    from '../models/Post.js';

/** POST /api/posts/:postId/comments */
export const createComment = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;
    // ensure post exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { content } = req.body;
    const commentId = await Comment.create({ postId, userId, content });
    const comments = await Comment.findByPost(postId);
    res.status(201).json({ message: 'Comment added', comments });
  } catch (err) {
    next(err);
  }
};

/** GET /api/posts/:postId/comments */
export const getCommentsByPost = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const comments = await Comment.findByPost(postId);
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/posts/:postId/comments/:id */
export const updateComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.id);
    const { content } = req.body;
    // (Optionally) verify ownership by loading the comment’s userId
    const updated = await Comment.update(commentId, { content });
    if (!updated) return res.status(404).json({ error: 'Comment not found' });
    const comments = await Comment.findByPost(Number(req.params.postId));
    res.json({ message: 'Comment updated', comments });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/posts/:postId/comments/:id */
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.id);
    const deleted = await Comment.delete(commentId);
    if (!deleted) return res.status(404).json({ error: 'Comment not found' });
    const comments = await Comment.findByPost(Number(req.params.postId));
    res.json({ message: 'Comment deleted', comments });
  } catch (err) {
    next(err);
  }
};

export default { createComment, getCommentsByPost, updateComment, deleteComment };