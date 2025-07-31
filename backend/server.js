// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import pool from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes     from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import userPostsRoutes from './routes/userPostsRoutes.js';
import postRoutes      from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';

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


// Public routes
app.use('/api/auth', authRoutes);

// Protected user routes
app.use('/api/user', userRoutes);

// Protected Category routes
app.use('/api/categories', categoryRoutes);

//Protected Tag routes
app.use('/api/tags', tagRoutes);

//Protected Post routes
app.use('/api/posts', postRoutes);

app.use('/api/users/:userId/posts', userPostsRoutes);

app.use('/api/posts/:postId/comments', commentRoutes);

app.use('/api/posts/:postId/likes', likeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


