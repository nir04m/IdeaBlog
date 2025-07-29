// backend/models/Tag.js
import pool from '../config/db.js';

class Tag {
  /** Create a new tag */
  static async create({ name }) {
    const [result] = await pool.execute(
      `INSERT INTO tags (name) VALUES (?)`,
      [name]
    );
    return result.insertId;
  }

  /** Get one by ID */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name, created_at AS createdAt
       FROM tags WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  /** Get all tags */
  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT id, name, created_at AS createdAt
       FROM tags`
    );
    return rows;
  }

  /** Update a tag’s name */
  static async update(id, { name }) {
    const [result] = await pool.execute(
      `UPDATE tags SET name = ? WHERE id = ?`,
      [name, id]
    );
    return result.affectedRows > 0;
  }

  /** Delete a tag */
  static async delete(id) {
    const [result] = await pool.execute(
      `DELETE FROM tags WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default Tag;

