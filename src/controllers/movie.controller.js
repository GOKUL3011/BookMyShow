import { Movie } from '../models/Movie.js';

export async function listMovies(_req, res) {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
}
