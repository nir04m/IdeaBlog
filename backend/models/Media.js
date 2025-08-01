// backend/models/Media.js
import pool from '../config/db.js';

class Media {
  /**
   * Create a new media record
   * @param {{ postId?: number|null, userId: number, url: string, type?: string|null }} args
   * @returns {Promise<number>} newly inserted media ID
   */
  static async create({ postId = null, userId, url, type = null }) {
    const [result] = await pool.execute(
      `INSERT INTO media (post_id, user_id, url, type)
       VALUES (?, ?, ?, ?)`,
      [postId, userId, url, type]
    );
    return result.insertId;
  }

  /**
   * Find a media record by its ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         post_id    AS postId,
         user_id    AS userId,
         url,
         type,
         created_at AS createdAt
       FROM media
       WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  /**
   * List all media items for a given post
   * @param {number} postId
   * @returns {Promise<Array<Object>>}
   */
  static async findByPost(postId) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         url,
         type,
         created_at AS createdAt
       FROM media
       WHERE post_id = ?
       ORDER BY created_at ASC`,
      [postId]
    );
    return rows;
  }

  /**
   * Delete a media record by its ID
   * @param {number} id
   * @returns {Promise<boolean>} true if deleted
   */
  static async delete(id) {
    const [result] = await pool.execute(
      `DELETE FROM media WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default Media;


