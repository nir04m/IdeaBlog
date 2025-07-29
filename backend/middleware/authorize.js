import User from '../models/User.js';

/**
 * Only allow through if the logged-in user has isAdmin = true.
 */
export async function authorizeAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    next();
  } catch (err) {
    next(err);
  }
}


