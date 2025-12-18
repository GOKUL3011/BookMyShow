# BookMyShow - Testing Guide

## Server Startup
```powershell
# If port 4000 is in use, kill it first:
netstat -ano | findstr :4000
# Note the PID and kill it:
Stop-Process -Id <PID> -Force

# Start the server:
npm run dev
```

## Complete Feature List

### ✅ Authentication
- [x] User Registration (separate page at /register.html)
- [x] User Login (landing page)
- [x] JWT token-based auth
- [x] Auto-redirect after registration
- [x] Logout with confirmation dialog
- [x] Session persistence (localStorage)

### ✅ Dashboard Navigation
- [x] Browse Movies - View all available movies
- [x] Book Tickets - Select seats and confirm booking
- [x] My Bookings - View booking history
- [x] Active tab highlighting
- [x] Smooth section transitions

### ✅ Movie Browsing
- [x] Display movie cards with title, language, description, duration, rating
- [x] Click to view showtimes
- [x] Loading states
- [x] Empty states
- [x] Error handling
- [x] Hover effects

### ✅ Showtime Selection
- [x] View showtimes for selected movie
- [x] Display screen, time, price, availability
- [x] One-click select and auto-switch to Book tab
- [x] Visual feedback
- [x] Available seat count

### ✅ Ticket Booking
- [x] Pre-filled showtime ID from selection
- [x] Comma-separated seat input (e.g., 1,2,3)
- [x] Validation (required fields, valid seats)
- [x] Atomic seat booking (prevents double-booking)
- [x] Success toast with emoji
- [x] Auto-navigate to My Bookings on success
- [x] Form auto-clear after booking
- [x] Keyboard shortcut (ESC to clear form)

### ✅ My Bookings
- [x] View all user bookings
- [x] Display booking ID, seats, amount, status, date
- [x] Sorted by most recent first
- [x] Loading and empty states
- [x] Error handling

### ✅ UI/UX Features
- [x] Red/white high-contrast theme
- [x] Responsive design (mobile-friendly)
- [x] Toast notifications (success, error, info)
- [x] Loading indicators
- [x] Empty state messages
- [x] Hover effects and transitions
- [x] Card animations
- [x] Sticky header
- [x] Focus states on inputs
- [x] Confirmation dialogs
- [x] Keyboard navigation support

### ✅ Backend Features
- [x] MongoDB Atlas integration
- [x] User registration with bcrypt
- [x] JWT token generation
- [x] Protected routes
- [x] Movie listing
- [x] Showtime queries by movie
- [x] Atomic booking operations
- [x] User booking history endpoint

## Testing Flow

1. **Registration**: Visit /register.html → Fill form → Auto-redirect to login
2. **Login**: Enter credentials → Redirected to dashboard
3. **Browse**: View movies → Click "View Showtimes"
4. **Select**: Choose showtime → Auto-switch to Book tab
5. **Book**: Enter seats (1,2,3) → Submit → Success toast → Auto-navigate to My Bookings
6. **View Bookings**: See booking history with details
7. **Logout**: Click Logout → Confirm → Return to login page

## Quick Test Commands

```powershell
# Test login API
Invoke-RestMethod http://localhost:4000/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"test@example.com","password":"test123"}'

# Test movies API
Invoke-RestMethod http://localhost:4000/api/movies

# Test health
Invoke-RestMethod http://localhost:4000/health
```

## Common Issues & Fixes

**Issue**: Port 4000 already in use
**Fix**: Kill the process using the port (see Server Startup section)

**Issue**: Can't connect to MongoDB
**Fix**: Check .env file has correct MONGODB_URI with whitelist IP in Atlas

**Issue**: Token expired/invalid
**Fix**: Logout and login again to get fresh token

**Issue**: Seats already booked
**Fix**: This is expected behavior - choose different seats

## Keyboard Shortcuts
- **ESC** - Clear booking form (when in Book tab)
