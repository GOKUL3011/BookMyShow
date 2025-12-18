import { Router } from 'express';
import { createBooking, getMyBookings } from '../controllers/booking.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.get('/my', auth, getMyBookings);
router.post('/', auth, createBooking);

export default router;
