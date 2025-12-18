import { Show } from '../models/Showtime.js';
import { Theatre } from '../models/Theatre.js';

export async function listShowtimesByMovie(req, res) {
  try {
    const { id } = req.params;
    const shows = await Show.find({ movieId: id })
      .populate('theatreId')
      .sort({ showTime: 1 });
    res.json(shows);
  } catch (err) {
    console.error('Error fetching shows:', err);
    res.status(500).json({ message: 'Failed to fetch shows', error: err.message });
  }
}
