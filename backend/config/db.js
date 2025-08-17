// backend/config/db.js
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Resolve __dirname in ES Modules
const __filename   = fileURLToPath(import.meta.url);
const __dirname    = dirname(__filename);

// Parse your DATABASE_URI
const dbUrl = new URL(process.env.DATABASE_URI);
const dbName = dbUrl.pathname.slice(1);

// Read the CA certificate
let caCert = null;

try {
  // try local file first
  const certPath = resolve(__dirname, '../certs/ca.pem');
  if (fs.existsSync(certPath)) {
    caCert = fs.readFileSync(certPath);
    logger.info('Loaded CA cert from file');
  }
} catch (e) {
  logger.warn('Could not read cert file:', e.message);
}

// if no file, check env vars
if (!caCert && process.env.DB_CA_PEM) {
  caCert = process.env.DB_CA_PEM;
  logger.info('Loaded CA cert from DB_CA_PEM env');
}
if (!caCert && process.env.DB_CA_B64) {
  caCert = Buffer.from(process.env.DB_CA_B64, 'base64').toString('utf8');
  logger.info('Loaded CA cert from DB_CA_B64 env');
}

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
    logger.info('Database schema initialized');

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
      logger.info('Added is_admin column to users table');
    } else {
      logger.info('is_admin column already exists; skipping ALTER');
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
      logger.info('Added tag_id column to posts table');
    } else {
      logger.info('tag_id column already exists; skipping ALTER');
    }

    // 2) Conditionally add is_admin column if it doesn't exist
    const [onboardingCols] = await pool.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME   = 'users'
         AND COLUMN_NAME  = 'onboarding'
       LIMIT 1`,
      [dbName]
    );
    if (onboardingCols.length === 0) {
      await pool.query(
        `ALTER TABLE users
         ADD COLUMN onboarding TINYINT(1) NOT NULL DEFAULT 0`
      );
      logger.info('Added onboarding column to users table');
    } else {
      logger.info('onboarding column already exists; skipping ALTER');
    }

  } catch (err) {
   logger.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();

export default pool;




