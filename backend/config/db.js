// backend/config/db.js
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Parse your DATABASE_URI
const dbUrl = new URL(process.env.DATABASE_URI);

// Read the CA certificate
const caCertPath = resolve(__dirname, '../certs/ca.pem');
const caCert     = fs.readFileSync(caCertPath);

// Read your init.sql (ensure it’s in the same folder as this file)
const initSqlPath = resolve(__dirname, 'init.sql');
const initSql     = fs.readFileSync(initSqlPath, 'utf8');

// Create the connection pool with SSL and multipleStatements enabled
const pool = mysql.createPool({
  host:               dbUrl.hostname,
  port:               dbUrl.port,
  user:               dbUrl.username,
  password:           dbUrl.password,
  database:           dbUrl.pathname.slice(1),
  ssl:                { ca: caCert },
  multipleStatements: true
});

// Run your schema-creation script once at startup
(async () => {
  try {
    await pool.query(initSql);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to run init.sql:', err);
    process.exit(1);
  }
})();

export default pool;




