// backend/models/PostCategory.js
import pool from '../config/db.js';

class PostCategory {
  /**
   * Add a category association to a post (ignores duplicates)
   * @param {{ postId: number, categoryId: number }} args
   */
  static async add({ postId, categoryId }) {
    await pool.execute(
      `INSERT IGNORE INTO post_categories (post_id, category_id)
       VALUES (?, ?)`,
      [postId, categoryId]
    );
  }

  /**
   * Remove a category association from a post
   * @param {{ postId: number, categoryId: number }} args
   * @returns {Promise<boolean>}
   */
  static async remove({ postId, categoryId }) {
    const [result] = await pool.execute(
      `DELETE FROM post_categories
       WHERE post_id = ? AND category_id = ?`,
      [postId, categoryId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Clear all category associations for a post
   * @param {number} postId
   */
  static async clearByPost(postId) {
    await pool.execute(
      `DELETE FROM post_categories WHERE post_id = ?`,
      [postId]
    );
  }

  /**
   * Fetch all categories associated with a post
   * @param {number} postId
   * @returns {Promise<Array<{id: number, name: string}>>}
   */
  static async findByPost(postId) {
    const [rows] = await pool.execute(
      `SELECT c.id, c.name
       FROM post_categories pc
       JOIN categories c ON pc.category_id = c.id
       WHERE pc.post_id = ?`,
      [postId]
    );
    return rows;
  }
}

export default PostCategory;


