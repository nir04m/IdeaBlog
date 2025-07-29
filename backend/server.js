// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import pool from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// health-check + DB-test route
// app.get('/', async (req, res) => {
//   try {
//     // simple query to verify connection
//     await pool.query('SELECT 1');
//     res.send('Server is up and database connection OK');
//   } catch (err) {
//     console.error('Database connection error:', err);
//     res.status(500).send('Server up but database connection failed');
//   }
// });



app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


