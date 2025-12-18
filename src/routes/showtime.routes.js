import { Router } from 'express';
import { listShowtimesByMovie } from '../controllers/showtime.controller.js';

const router = Router();
router.get('/:id/showtimes', listShowtimesByMovie);

export default router;
