import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Movie } from '../models/Movie.js';
import { Show } from '../models/Showtime.js';
import { Theatre } from '../models/Theatre.js';

dotenv.config();

async function seed() {
  await connectDB();

  // Clear existing data
  await Show.deleteMany({});
  await Movie.deleteMany({});
  await Theatre.deleteMany({});

  // Create Theatres
  const theatres = await Theatre.insertMany([
    {
      name: 'PVR Cinemas',
      location: 'Inorbit Mall, Mumbai',
    },
    {
      name: 'INOX Megaplex',
      location: 'Phoenix Marketcity, Bangalore',
    },
    {
      name: 'Cinepolis',
      location: 'DLF Mall, Delhi',
    },
  ]);

  // Create Movies with genre
  const movies = await Movie.insertMany([
    {
      title: 'Jawan',
      description: 'A high-octane action thriller about a man on a mission to rectify the wrongs in society. Shah Rukh Khan delivers a powerful performance in dual roles.',
      duration: 169,
      language: 'Hindi',
      genre: 'Action',
      rating: 4.5,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg',
    },
    {
      title: 'Pathaan',
      description: 'An exiled RAW agent partners with ISI agent Rubina to take down a former soldier leading a private army. Shah Rukh Khan returns to action.',
      duration: 146,
      language: 'Hindi',
      genre: 'Action',
      rating: 4.3,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Pathaan_film_poster.jpg',
      
    },
    {
      title: '3 Idiots',
      description: 'Two friends embark on a quest to find their long lost companion. They revisit their college days and recall the memories of their friend who inspired them.',
      duration: 170,
      language: 'Hindi',
      genre: 'Comedy',
      rating: 4.8,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg',
    },
    {
      title: 'Dilwale Dulhania Le Jayenge',
      description: 'A young couple in love must win over the girls strict father. A timeless romantic classic starring Shah Rukh Khan and Kajol.',
      duration: 189,
      language: 'Hindi',
      genre: 'Romance',
      rating: 4.9,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/8/80/Dilwale_Dulhania_Le_Jayenge_poster.jpg',
    },
  ]);

  // Create Shows with theatreId reference
  const now = new Date();
  const oneHour = 60 * 60 * 1000;

  await Show.insertMany([
    // The Minimalist shows
    {
      movieId: movies[0]._id,
      theatreId: theatres[0]._id,
      showTime: new Date(now.getTime() + oneHour),
      totalSeats: 30,
    },
    {
      movieId: movies[0]._id,
      theatreId: theatres[1]._id,
      showTime: new Date(now.getTime() + 3 * oneHour),
      totalSeats: 30,
    },
    // Express Lane shows
    {
      movieId: movies[1]._id,
      theatreId: theatres[0]._id,
      showTime: new Date(now.getTime() + 2 * oneHour),
      totalSeats: 25,
    },
    {
      movieId: movies[1]._id,
      theatreId: theatres[2]._id,
      showTime: new Date(now.getTime() + 4 * oneHour),
      totalSeats: 40,
    },
    // Mumbai Nights shows
    {
      movieId: movies[2]._id,
      theatreId: theatres[1]._id,
      showTime: new Date(now.getTime() + oneHour),
      totalSeats: 35,
    },
    {
      movieId: movies[2]._id,
      theatreId: theatres[2]._id,
      showTime: new Date(now.getTime() + 5 * oneHour),
      totalSeats: 50,
    },
    // Code Warriors shows
    {
      movieId: movies[3]._id,
      theatreId: theatres[0]._id,
      showTime: new Date(now.getTime() + 6 * oneHour),
      totalSeats: 45,
    },
    {
      movieId: movies[3]._id,
      theatreId: theatres[2]._id,
      showTime: new Date(now.getTime() + 7 * oneHour),
      totalSeats: 40,
    },
  ]);

  console.log('✅ Seeded 3 theatres, 4 movies, and 8 shows');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
