// backend/models/Like.js
import pool from '../config/db.js';

class Like {
  /** Add a like */
  static async add({ postId, userId }) {
    await pool.execute(
      `INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)`,
      [postId, userId]
    );
  }

  /** Remove a like */
  static async remove({ postId, userId }) {
    const [result] = await pool.execute(
      `DELETE FROM likes WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );
    return result.affectedRows > 0;
  }

  /** Count likes on a post */
  static async countForPost(postId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM likes WHERE post_id = ?`,
      [postId]
    );
    return rows[0].count;
  }

  /** Check if a user has liked a post */
  static async exists({ postId, userId }) {
    const [rows] = await pool.execute(
      `SELECT 1 FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1`,
      [postId, userId]
    );
    return rows.length > 0;
  }
}

export default Like;

