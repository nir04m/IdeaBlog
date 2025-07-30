// backend/models/Post.js
import pool from '../config/db.js';

class Post {
  /**
   * Create a new post.
   * @param {{ userId: number, categoryId: number, title: string, content?: string, imageUrl?: string }} data
   * @returns {Promise<number>} the new post’s ID
   */
  static async create({ userId, categoryId, title, content = null, imageUrl = null }) {
    const [result] = await pool.execute(
      `INSERT INTO posts (user_id, category_id, title, content, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, categoryId, title, content, imageUrl]
    );
    return result.insertId;
  }

  /**
   * Find a post by its ID.
   * @param {number} id
   * @returns {Promise<Object?>}
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         user_id     AS userId,
         category_id AS categoryId,
         title,
         content,
         image_url   AS imageUrl,
         created_at  AS createdAt,
         updated_at  AS updatedAt
       FROM posts
       WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  /**
   * Get all posts (public feed).
   * @returns {Promise<Object[]>}
   */
  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT
         id,
         user_id     AS userId,
         category_id AS categoryId,
         title,
         content,
         image_url   AS imageUrl,
         created_at  AS createdAt,
         updated_at  AS updatedAt
       FROM posts
       ORDER BY created_at DESC`
    );
    return rows;
  }

  /**
   * Get all posts by a given user.
   * @param {number} userId
   * @returns {Promise<Object[]>}
   */
  static async findByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         user_id     AS userId,
         category_id AS categoryId,
         title,
         content,
         image_url   AS imageUrl,
         created_at  AS createdAt,
         updated_at  AS updatedAt
       FROM posts
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Update a post’s fields (only non-null values).
   * @param {number} id
   * @param {{ title?: string, content?: string, imageUrl?: string, categoryId?: number }} data
   * @returns {Promise<boolean>}
   */
  static async update(id, { title = null, content = null, imageUrl = null, categoryId = null }) {
    const [result] = await pool.execute(
      `UPDATE posts SET
         title       = COALESCE(?, title),
         content     = COALESCE(?, content),
         image_url   = COALESCE(?, image_url),
         category_id = COALESCE(?, category_id)
       WHERE id = ?`,
      [title, content, imageUrl, categoryId, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete a post by ID.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const [result] = await pool.execute(
      `DELETE FROM posts WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default Post;


