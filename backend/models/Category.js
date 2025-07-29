// backend/models/Category.js
import pool from '../config/db.js';

class Category {
  /** Create a new category */
  static async create({ name, description = null }) {
    const [result] = await pool.execute(
      `INSERT INTO categories (name, description)
       VALUES (?, ?)`,
      [name, description]
    );
    return result.insertId;
  }

  /** Get one by ID */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name, description, created_at AS createdAt, updated_at AS updatedAt
       FROM categories WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  /** Get all categories */
  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT id, name, description, created_at AS createdAt, updated_at AS updatedAt
       FROM categories`
    );
    return rows;
  }

  /** Update a category */
  static async update(id, { name = null, description = null }) {
    const [result] = await pool.execute(
      `UPDATE categories SET
         name        = COALESCE(?, name),
         description = COALESCE(?, description)
       WHERE id = ?`,
      [name, description, id]
    );
    return result.affectedRows > 0;
  }

  /** Delete a category */
  static async delete(id) {
    const [result] = await pool.execute(
      `DELETE FROM categories WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default Category;


