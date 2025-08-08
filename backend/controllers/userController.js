// backend/controllers/userController.js
import User from '../models/User.js';
import { uploadToR2, deleteFromR2 } from '../services/mediaService.js';
import crypto from 'crypto';   

/**
 * GET /api/user
 * Return the current user’s profile (no password).
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/user
 * Update the current user’s profile fields.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { username, bio, profilePicture } = req.body;
    const success = await User.updateProfile(req.user.id, {
      username,
      bio,
      profilePicture
    });
    if (!success) {
      return res.status(400).json({ error: 'Profile update failed' });
    }
    const updated = await User.findById(req.user.id);
    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    next(err);
  }
};

export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1) fetch the current user row so we can delete their old avatar
    const existing = await User.findById(req.user.id);

    if (existing?.profile_picture) {
      // extract just the key from the URL
      const parsed = new URL(existing.profile_picture);
      const key = parsed.pathname.replace(`/${process.env.CF_R2_BUCKET}/`, '');
      await deleteFromR2({ key });
    }

    // 2) generate a new key and upload
    const ext = req.file.originalname.split('.').pop();
    const key = `avatars/${req.user.id}/${crypto.randomUUID()}.${ext}`;
    const url = await uploadToR2({
      key,
      body: req.file.buffer,
      contentType: req.file.mimetype,
    });

    // 3) persist it to the user
    await User.updateProfile(req.user.id, { profilePicture: url });

    // 4) respond with exactly `{ url }`
    res.json({ url });
  } catch (err) {
    console.error("uploadAvatar error:", err);
    next(err);
  }
}

/**
 * DELETE /api/media/avatar
 *  • remove the current avatar both in R2 + DB
 */
export async function deleteAvatar(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.profile_picture) {
      return res.status(404).json({ error: 'No avatar to delete' });
    }
    await deleteFromR2(user.profile_picture);
    await User.updateProfilePicture(req.user.id, null);
    res.json({ message: 'Avatar removed' });
  } catch (err) {
    next(err);
  }
}


