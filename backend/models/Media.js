// backend/models/Media.js
import pool from '../config/db.js';

class Media {
  /**
   * Create a new media record.
   * @param {{ postId: number, url: string, type?: string|null }} args
   * @returns {Promise<number>} newly inserted media ID
   */
  static async create({ postId, url, type = null }) {
    const [result] = await pool.execute(
      `INSERT INTO media (post_id, file_url, file_type)
       VALUES (?, ?, ?)`,
      [postId, url, type]
    );
    return result.insertId;
  }

  /**
   * Find a media record by its ID.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         post_id     AS postId,
         file_url    AS url,
         file_type   AS type,
         uploaded_at AS uploadedAt
       FROM media
       WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  /**
   * List all media items for a given post.
   * @param {number} postId
   * @returns {Promise<Array<Object>>}
   */
  static async findByPost(postId) {
    const [rows] = await pool.execute(
      `SELECT
         id,
         post_id     AS postId,
         file_url    AS url,
         file_type   AS type,
         uploaded_at AS uploadedAt
       FROM media
       WHERE post_id = ?
       ORDER BY uploaded_at ASC`,
      [postId]
    );
    return rows;
  }

  /**
   * Delete a media record by its ID.
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


