// backend/models/Comment.js
import pool from '../config/db.js';

class Comment {
  /** Create a new comment */
  static async create({ postId, userId, content }) {
    const [result] = await pool.execute(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES (?, ?, ?)`,
      [postId, userId, content]
    );
    return result.insertId;
  }

  /** Get all comments for a post */
  static async findByPost(postId) {
    const [rows] = await pool.execute(
      `SELECT
         c.id,
         c.post_id    AS postId,
         c.user_id    AS userId,
         c.content,
         c.created_at AS createdAt,
         c.updated_at AS updatedAt,
         u.username   AS author
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );
    return rows;
  }

  /** Update a comment's content */
  static async update(id, { content }) {
    const [result] = await pool.execute(
      `UPDATE comments
       SET content = ?
       WHERE id = ?`,
      [content, id]
    );
    return result.affectedRows > 0;
  }

  /** Delete a comment */
  static async delete(id) {
    const [result] = await pool.execute(
      `DELETE FROM comments WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default Comment;

