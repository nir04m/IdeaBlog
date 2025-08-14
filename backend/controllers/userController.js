// backend/controllers/userController.js
import User from '../models/User.js';
import { uploadToR2, deleteFromR2 } from '../services/mediaService.js';
import crypto from 'crypto';

/* ---------------- helpers ---------------- */

const isR2Host = (host) =>
  host.endsWith('.r2.dev') || host.endsWith('.r2.cloudflarestorage.com');

/**
 * Turn a full URL into the R2 object key.
 * Works for both public.dev (no bucket in path) and S3 endpoint (/<bucket>/...).
 */
const extractR2Key = (url, bucket) => {
  const u = new URL(url);
  let key = u.pathname.replace(/^\/+/, ''); // remove leading slash(es)
  if (bucket && key.startsWith(`${bucket}/`)) {
    key = key.slice(bucket.length + 1);
  }
  return key; // e.g. "avatars/8/abc.jpg"
};

/* --------------- GET /api/user --------------- */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/* --------------- PUT /api/user --------------- */
/**
 * Allows updating username, bio, and/or profilePicture directly.
 * If profilePicture changes, we delete the old object afterward (best effort).
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, bio, profilePicture, markOnboarded } = req.body;

    const existing = await User.findById(userId);
    if (!existing) return res.status(404).json({ error: 'User not found' });
    const oldUrl = existing.profilePicture || null;

    // Update first (so we never orphan the user with no avatar on failure)
    const ok = await User.updateProfile(userId, {
      username: username ?? null,
      bio: bio ?? null,
      profilePicture: profilePicture ?? null,
    });
    
    if (!ok) return res.status(400).json({ error: 'Profile update failed' });

    const shouldMark = (markOnboarded === true || markOnboarded === 'true');
    if (shouldMark) {
      await User.setOnboarding(userId, true);
    }

    const updated = await User.findById(userId);
    res.json({ message: 'Profile updated', user: updated });

    // If avatar changed, try to delete the old one in the background
    const BUCKET = process.env.CF_R2_BUCKET;
    if (oldUrl && profilePicture && oldUrl !== profilePicture) {
      try {
        const u = new URL(oldUrl);
        if (isR2Host(u.host)) {
          const key = extractR2Key(oldUrl, BUCKET);
          if (key.startsWith(`avatars/${userId}/`)) {
            await deleteFromR2({ key });
          }
        }
      } catch {
        /* ignore parse errors */
      }
    }
  } catch (err) {
    next(err);
  }
};

/* -------- POST /api/user/avatar (multipart) -------- */
/**
 * Uploads a new avatar file for the user, sets it on the user,
 * then best-effort deletes the previous avatar in R2.
 */
export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const userId = req.user.id;
    const existing = await User.findById(userId);
    const oldUrl = existing?.profilePicture || null;

    const ext = (req.file.originalname.split('.').pop() || 'bin').toLowerCase();
    const key = `avatars/${userId}/${crypto.randomUUID()}.${ext}`;

    // 1) Upload new object
    const url = await uploadToR2({
      key,
      body: req.file.buffer,
      contentType: req.file.mimetype,
    });

    // 2) Persist it to the user
    await User.updateProfile(userId, { profilePicture: url });

    // 3) Respond now
    res.json({ url });

    // 4) Best-effort delete previous avatar
    if (oldUrl && oldUrl !== url) {
      try {
        const BUCKET = process.env.CF_R2_BUCKET;
        const u = new URL(oldUrl);
        if (isR2Host(u.host)) {
          const oldKey = extractR2Key(oldUrl, BUCKET);
          if (oldKey.startsWith(`avatars/${userId}/`)) {
            await deleteFromR2({ key: oldKey });
          }
        }
      } catch {
        /* ignore */
      }
    }
  } catch (err) {
    console.error('uploadAvatar error:', err);
    next(err);
  }
}

/* -------- DELETE /api/media/avatar -------- */
export async function deleteAvatar(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const currentUrl = user?.profilePicture || null;
    if (!currentUrl) return res.status(404).json({ error: 'No avatar to delete' });

    // 1) Clear the DB first
    await User.updateProfile(userId, { profilePicture: null });

    // 2) Best-effort delete from R2 (only if it’s ours and in the expected folder)
    try {
      const BUCKET = process.env.CF_R2_BUCKET;
      const u = new URL(currentUrl);
      if (isR2Host(u.host)) {
        const key = extractR2Key(currentUrl, BUCKET);
        if (key.startsWith(`avatars/${userId}/`)) {
          await deleteFromR2({ key });
        }
      }
    } catch {
      /* ignore */
    }

    res.json({ message: 'Avatar removed' });
  } catch (err) {
    next(err);
  }
}
