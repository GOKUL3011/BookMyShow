import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    seats: { type: [Number], required: true },
    totalPrice: { type: Number, required: true }, // renamed from amount
    status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
    bookedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
