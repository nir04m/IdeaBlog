// backend/models/Post.js
import pool from '../config/db.js';

class Post {
  /**
   * Create a new post.
   * @param {{ userId: number, categoryId: number, title: string, content?: string, imageUrl?: string }} data
   * @returns {Promise<number>} the new post’s ID
   */
  static async create({ userId, categoryId, title, content = null, imageUrl = null, tagId = null }) {
    const [result] = await pool.execute(
      `INSERT INTO posts
         (user_id, category_id, title, content, image_url, tag_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, categoryId, title, content, imageUrl, tagId]
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
         p.id,
         p.user_id            AS userId,
         u.username           AS authorName,
         u.profile_picture    AS authorPicture,
         p.category_id        AS categoryId,
         p.tag_id             AS tagId,
         p.title,
         p.content,
         p.image_url          AS imageUrl,
         p.created_at         AS createdAt,
         p.updated_at         AS updatedAt
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
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
         p.id,
         p.user_id            AS userId,
         u.username           AS authorName,
         u.profile_picture    AS authorPicture,
         p.category_id        AS categoryId,
         p.tag_id             AS tagId,
         p.title,
         p.content,
         p.image_url          AS imageUrl,
         p.created_at         AS createdAt,
         p.updated_at         AS updatedAt
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
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
         p.id,
         p.user_id            AS userId,
         u.username           AS authorName,
         u.profile_picture    AS authorPicture,
         p.category_id        AS categoryId,
         p.tag_id             AS tagId,
         p.title,
         p.content,
         p.image_url          AS imageUrl,
         p.created_at         AS createdAt,
         p.updated_at         AS updatedAt
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
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
  static async update(id, { categoryId = null, tagId = null, title = null, content = null, imageUrl = null }) {
    const [result] = await pool.execute(
      `UPDATE posts SET
         category_id = COALESCE(?, category_id),
         tag_id      = COALESCE(?, tag_id),
         title       = COALESCE(?, title),
         content     = COALESCE(?, content),
         image_url   = COALESCE(?, image_url)
       WHERE id = ?`,
      [categoryId, tagId, title, content, imageUrl, id]
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


