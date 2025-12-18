# BookMyShow (Minimal Full-Stack)

A minimal Node.js + Express backend with MongoDB Atlas and a clean red/white themed frontend for movie listing, showtime selection, and ticket booking with JWT-based auth.

## Features
- User registration and login with JWT authentication
- Browse movies with descriptions and ratings
- View showtimes for selected movies
- Book tickets (authenticated users only)
- Red/white high-contrast UI theme
- Responsive design for mobile and desktop

## Tech Stack
**Backend:**
- Node.js, Express
- MongoDB (Mongoose)
- JWT auth, bcrypt

**Frontend:**
- Vanilla JavaScript (ES6+)
- HTML5, CSS3
- Red/White themed UI

## Setup
1. Copy `.env.example` to `.env` and set values:
```
PORT=4000
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secret
```

2. Install dependencies:
```
npm install
```

3. Seed sample data:
```
npm run seed
```

4. Start the server:
```
npm run dev
```

5. Open in browser:
```
http://localhost:4000
```

## User Flow
1. **Landing Page** (`/`) - Shows login form
   - Click "Create an account" to register
2. **Register Page** (`/register.html`) - New user registration
   - After successful registration, redirects back to login
3. **Dashboard** (after login) - Shows two tabs:
   - **Browse**: View movies and their showtimes
   - **Book**: Select seats and confirm booking

## API Endpoints
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login and get JWT token
- GET `/api/movies` - List all movies
- GET `/api/movies/:id/showtimes` - Get showtimes for a movie
- POST `/api/bookings` - Book seats (requires auth token)

## Notes
- Seat booking uses atomic MongoDB update to prevent double-booking
- JWT token stored in localStorage for session persistence
- Logout clears token and returns to login page
- Red/white theme applied consistently across all pages
