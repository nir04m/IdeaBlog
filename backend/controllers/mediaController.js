// backend/controllers/mediaController.js
import Media from '../models/Media.js';
import Post  from '../models/Post.js';
import { uploadToR2, deleteFromR2 } from '../services/mediaService.js';
import crypto from 'crypto';

export const uploadMedia = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;
    const post   = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // generate a unique key for R2
    const ext = req.file.originalname.split('.').pop();
    const key = `media/${crypto.randomUUID()}.${ext}`;

    // upload to R2
    const url = await uploadToR2({
      key,
      body: req.file.buffer,
      contentType: req.file.mimetype
    });

    // record in DB
    const mediaId = await Media.create({ postId, userId, url, type: req.file.mimetype });
    const media   = await Media.findById(mediaId);
    res.status(201).json({ message: 'Media uploaded', media });
  } catch (err) {
    next(err);
  }
};

export const getMediaForPost = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const list   = await Media.findByPost(postId);
    res.json({ media: list });
  } catch (err) {
    next(err);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const mediaId = Number(req.params.id);
    const record  = await Media.findById(mediaId);
    if (!record) return res.status(404).json({ error: 'Media not found' });
    if (req.user.id !== record.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // extract R2 key from URL
    const urlParts = new URL(record.url);
    const key = urlParts.pathname.replace(`/${process.env.CF_R2_BUCKET}/`, '');

    // delete from R2
    await deleteFromR2({ key });

    // delete DB record
    await Media.delete(mediaId);
    res.json({ message: 'Media deleted' });
  } catch (err) {
    next(err);
  }
};




