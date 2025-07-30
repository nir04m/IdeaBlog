// backend/config/db.js
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Resolve __dirname in ES Modules
const __filename   = fileURLToPath(import.meta.url);
const __dirname    = dirname(__filename);

// Parse your DATABASE_URI
const dbUrl = new URL(process.env.DATABASE_URI);
const dbName = dbUrl.pathname.slice(1);

// Read the CA certificate
const caCert = fs.readFileSync(resolve(__dirname, '../certs/ca.pem'));

// Read your init.sql (minus any ALTER statements)
const initSql = fs.readFileSync(resolve(__dirname, 'init.sql'), 'utf8');

// Create the pool
const pool = mysql.createPool({
  host:               dbUrl.hostname,
  port:               dbUrl.port,
  user:               dbUrl.username,
  password:           dbUrl.password,
  database:           dbName,
  ssl:                { ca: caCert },
  multipleStatements: true
});

(async () => {
  try {
    // 1) Run core schema
    await pool.query(initSql);
    console.log('Database schema initialized');

    // 2) Conditionally add is_admin column if it doesn't exist
    const [adminCols] = await pool.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME   = 'users'
         AND COLUMN_NAME  = 'is_admin'
       LIMIT 1`,
      [dbName]
    );
    if (adminCols.length === 0) {
      await pool.query(
        `ALTER TABLE users
         ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0`
      );
      console.log('Added is_admin column to users table');
    } else {
      console.log('is_admin column already exists; skipping ALTER');
    }

    // 3) Conditionally add tag_id column to posts if it doesn't exist
    const [tagCols] = await pool.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME   = 'posts'
         AND COLUMN_NAME  = 'tag_id'
       LIMIT 1`,
      [dbName]
    );
    if (tagCols.length === 0) {
      await pool.query(
        `ALTER TABLE posts
         ADD COLUMN tag_id INT NULL,
         ADD FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL`
      );
      console.log('Added tag_id column to posts table');
    } else {
      console.log('tag_id column already exists; skipping ALTER');
    }

  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();

export default pool;




