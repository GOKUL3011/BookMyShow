import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import movieRoutes from './routes/movie.routes.js';
import showtimeRoutes from './routes/showtime.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/movies', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);

// API info at /api
app.get('/api', (_req, res) => {
  res.json({
    name: 'BookMyShow Minimal API',
    version: '0.1.0',
    health: '/health',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      movies: 'GET /api/movies',
      showtimesByMovie: 'GET /api/movies/:id/showtimes',
      createBooking: 'POST /api/bookings (auth)'
    }
  });
});

export default app;
