import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    duration: { type: Number, required: true }, // renamed from durationMins
    language: { type: String, default: 'English' },
    genre: { type: String, default: 'Drama' },
    rating: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Movie = mongoose.model('Movie', movieSchema);
