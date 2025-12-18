import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
    showTime: { type: Date, required: true }, // renamed from startTime
    totalSeats: { type: Number, required: true, min: 1 },
    bookedSeats: { type: [Number], default: [] },
  },
  { timestamps: true }
);

export const Show = mongoose.model('Show', showSchema);
