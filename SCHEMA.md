# Database Schema

All entities have been implemented with the specified structure:

## 1. User
```
User
 ├── _id (ObjectId, auto-generated)
 ├── name (String, required)
 ├── email (String, required, unique, indexed)
 ├── password (String, hashed with bcrypt)
 └── createdAt (Date, auto-generated)
```

## 2. Movie
```
Movie
 ├── _id (ObjectId, auto-generated)
 ├── title (String, required)
 ├── description (String)
 ├── duration (Number, minutes)
 ├── language (String, default: 'English')
 ├── genre (String, default: 'Drama')
 └── createdAt (Date, auto-generated)
```

## 3. Theatre
```
Theatre
 ├── _id (ObjectId, auto-generated)
 ├── name (String, required)
 └── location (String, required)
```

## 4. Show (previously Showtime)
```
Show
 ├── _id (ObjectId, auto-generated)
 ├── movieId (ObjectId, ref: 'Movie', indexed)
 ├── theatreId (ObjectId, ref: 'Theatre', indexed)
 ├── showTime (Date, required)
 ├── totalSeats (Number, required, min: 1)
 └── bookedSeats ([Number], default: [])
```

## 5. Booking
```
Booking
 ├── _id (ObjectId, auto-generated)
 ├── userId (ObjectId, ref: 'User', indexed)
 ├── showId (ObjectId, ref: 'Show', indexed)
 ├── seats ([Number], required)
 ├── totalPrice (Number, required)
 ├── status (String, enum: ['CONFIRMED', 'CANCELLED'])
 ├── bookedAt (Date, default: Date.now)
 └── createdAt (Date, auto-generated)
```

---

## Booking Flow (Implemented)

### Step-by-Step Process:

1. **User selects a movie**
   - Browse movies from `/api/movies`
   - View movie details (title, genre, duration, rating)

2. **User selects a showtime**
   - View available shows for selected movie via `/api/movies/:id/showtimes`
   - Shows display theatre name, location, showtime, and available seats

3. **User selects seats**
   - Visual seat selector shows all seats (1 to totalSeats)
   - Booked seats are disabled (red)
   - Available seats can be clicked to select (green)
   - User can select multiple seats

4. **Backend checks: Are seats already booked?**
   - Atomic MongoDB operation prevents race conditions:
   ```javascript
   Show.findOneAndUpdate(
     { _id: showId, bookedSeats: { $nin: seats } },
     { $addToSet: { bookedSeats: { $each: seats } } },
     { new: true }
   )
   ```
   - This ensures that ONLY if none of the selected seats are in `bookedSeats`, they will be added

5. **If NOT booked:**
   - Seats are atomically added to `bookedSeats` array in Show document
   - New Booking record is created with:
     - userId (from JWT token)
     - showId
     - seats array
     - totalPrice (calculated)
     - status: 'CONFIRMED'
     - bookedAt timestamp

6. **Return confirmation**
   - Success: Returns booking details with 201 status
   - Conflict: Returns 409 error if seats already booked
   - User sees "🎉 Booking confirmed!" toast notification
   - Automatically navigates to "My Bookings" tab

---

## Sample Data (Seeded)

### Theatres (3):
- PVR Cinemas (Inorbit Mall, Mumbai)
- INOX Megaplex (Phoenix Marketcity, Bangalore)
- Cinepolis (DLF Mall, Delhi)

### Movies (4):
1. **The Minimalist** - Drama, 110 mins, English, Rating: 4.2
2. **Express Lane** - Thriller, 95 mins, English, Rating: 4.0
3. **Mumbai Nights** - Romance, 130 mins, Hindi, Rating: 4.5
4. **Code Warriors** - Action, 120 mins, English, Rating: 3.8

### Shows (8):
- Multiple shows across 3 theatres
- Different time slots (1hr, 2hr, 3hr... from current time)
- Seat capacity: 25-50 seats per show
- All shows include theatreId and movieId references

Run `npm run seed` to populate the database with this sample data.
