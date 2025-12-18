import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { Show } from './src/models/Showtime.js';
import { Theatre } from './src/models/Theatre.js';
import { Movie } from './src/models/Movie.js';

dotenv.config();
await connectDB();

console.log('Testing Show query...');
const shows = await Show.find().limit(1);
console.log('Shows found:', shows.length);
if (shows.length > 0) {
  console.log('First show:', JSON.stringify(shows[0], null, 2));
}

console.log('\nTesting with populate...');
const showsWithPopulate = await Show.find().populate('theatreId').populate('movieId').limit(1);
console.log('Shows with populate:', showsWithPopulate.length);
if (showsWithPopulate.length > 0) {
  console.log('First show with populate:', JSON.stringify(showsWithPopulate[0], null, 2));
}

process.exit(0);
