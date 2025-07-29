// backend/controllers/userController.js
import User from '../models/User.js';

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


