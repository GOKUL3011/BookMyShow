import mongoose from 'mongoose';
import { Show } from '../models/Showtime.js';
import { Booking } from '../models/Booking.js';

export async function createBooking(req, res) {
  const { showId, seats } = req.body;
  if (!showId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: 'showId and seats[] required' });
  }

  try {
    // Step 1: User selects seats
    // Step 2: Backend checks if seats are already booked
    const show = await Show.findById(showId).populate('theatreId');
    if (!show) return res.status(404).json({ message: 'Show not found' });

    // Validate seats are within range
    const invalid = seats.some((s) => s < 1 || s > show.totalSeats);
    if (invalid) return res.status(400).json({ message: 'Invalid seat numbers' });

    // Step 3: Atomic update to prevent double booking
    // If seats are NOT booked, add them to bookedSeats array
    const updated = await Show.findOneAndUpdate(
      { _id: showId, bookedSeats: { $nin: seats } },
      { $addToSet: { bookedSeats: { $each: seats } } },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({ message: 'Some seats already booked' });
    }

    // Step 4: Create booking record
    const pricePerSeat = 200; // Default price, ideally get from show/theatre
    const totalPrice = seats.length * pricePerSeat;
    const booking = await Booking.create({
      userId: new mongoose.Types.ObjectId(req.user.id),
      showId: show._id,
      seats,
      totalPrice,
      status: 'CONFIRMED',
      bookedAt: new Date(),
    });

    // Step 5: Return confirmation
    return res.status(201).json({
      id: booking._id,
      showId: booking.showId,
      seats: booking.seats,
      totalPrice: booking.totalPrice,
      status: booking.status,
      bookedAt: booking.bookedAt,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Booking failed', error: err.message });
  }
}

export async function getMyBookings(req, res) {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId' },
          { path: 'theatreId' }
        ]
      })
      .sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}
