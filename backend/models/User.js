// backend/models/User.js
import pool from '../config/db.js';

class User {
  /**
   * Create a new user record.
   * @param {{ username: string, email: string, passwordHash: string, bio?: string, profilePicture?: string }} data
   * @returns {Promise<number>} the newly created user’s ID
   */
  static async create({ username, email, passwordHash, bio = null, profilePicture = null }) {
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password, bio, profile_picture)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, passwordHash, bio, profilePicture]
    );
    return result.insertId;
  }

  /**
   * Find a user by their email.
   * @param {string} email
   * @returns {Promise<Object?>} the user row or null
   */
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] ?? null;
  }

  /**
   * Find a user by their username.
   * @param {string} username
   * @returns {Promise<Object?>} the user row or null
   */
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );
    return rows[0] ?? null;
  }

  /**
   * Retrieve a user by ID (omit password).
   * @param {number} id
   * @returns {Promise<Object?>} the user row without password or null
   */  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id,
              username,
              email,
              bio,
              profile_picture AS profilePicture,
              is_admin      AS isAdmin
       FROM users
       WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  /**
   * Update profile fields (username, bio, profile picture).
   * Only non-null fields are changed.
   * @param {number} id
   * @param {{ username?: string, bio?: string, profilePicture?: string }} data
   * @returns {Promise<boolean>} true if row was updated
   */
  static async updateProfile(id, { username = null, bio = null, profilePicture = null }) {
    const [result] = await pool.execute(
      `UPDATE users SET
         username = COALESCE(?, username),
         bio = COALESCE(?, bio),
         profile_picture = COALESCE(?, profile_picture)
       WHERE id = ?`,
      [username, bio, profilePicture, id]
    );
    return result.affectedRows > 0;
  }
}

export default User;


