import pool from '../config/db.js';
export default class PostTag {
  static async add({ postId, tagId }) {
    await pool.execute(
      `INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
      [postId, tagId]
    );
  }
  static async clearByPost(postId) {
    await pool.execute(
      `DELETE FROM post_tags WHERE post_id = ?`,
      [postId]
    );
  }
}


