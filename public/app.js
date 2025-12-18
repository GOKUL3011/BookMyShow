const $ = (sel) => document.querySelector(sel);
const api = {
  movies: async () => (await fetch('/api/movies')).json(),
  showtimes: async (movieId) => (await fetch(`/api/movies/${movieId}/showtimes`)).json(),
  register: async (name, email, password) => (await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })).json(),
  login: async (email, password) => (await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })).json(),
  book: async (token, showId, seats) => {
    const r = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ showId, seats }) });
    return { status: r.status, body: await r.json() };
  },
  getMyBookings: async (token) => {
    const r = await fetch('/api/bookings/my', { headers: { 'Authorization': `Bearer ${token}` } });
    if (r.ok) return r.json();
    return [];
  }
};

function showToast(message, type = 'info') {
  const t = $('#toast');
  if (!t) return;
  t.textContent = message;
  t.classList.add('show');
  // Red/white theme only: use deeper red for error/success, lighter for info
  t.style.borderColor = type === 'error' ? '#f5c2c7' : type === 'success' ? '#f5c2c7' : '#efefef';
  setTimeout(() => t.classList.remove('show'), 2500);
}

function setAuthState() {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const badge = $('#auth-badge');
  const logout = $('#btn-logout');
  const authState = $('#auth-state');
  if (authState) authState.innerHTML = token ? `Logged in as <b>${email}</b>` : '<span class="muted">Not logged in</span>';
  if (badge) badge.textContent = token ? `Signed in: ${email}` : 'Not logged in';
  if (logout) logout.style.display = token ? 'inline-block' : 'none';
}

async function loadMovies() {
  const $list = $('#movies');
  if (!$list) return;
  $list.innerHTML = '<div class="muted">Loading movies...</div>';
  try {
    const movies = await api.movies();
    $list.innerHTML = '';
    if (!movies || movies.length === 0) {
      $list.innerHTML = '<div class="muted">No movies available.</div>';
      return;
    }
    movies.forEach(m => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      ${m.imageUrl ? `<img src="${m.imageUrl}" alt="${m.title}" style="width:100%;height:300px;object-fit:cover;border-radius:8px;margin-bottom:12px" onerror="this.style.display='none'">` : ''}
      <div style="margin-bottom:8px"><h3 style="margin:0;color:var(--primary)">${m.title}</h3></div>
      <div style="margin-bottom:6px"><span class="badge" style="background:#22c55e;color:#fff">${m.genre || 'Drama'}</span> <span class="muted">${m.language}</span></div>
      <div class="muted" style="margin-bottom:8px">${m.description || 'No description'}</div>
      <div class="muted" style="margin-bottom:12px"><b>${m.duration} mins</b> · ⭐ ${m.rating ?? 0}/5</div>
      <button class="btn" data-id="${m._id}" style="width:100%">🎬 Book Tickets</button>
    `;
    div.querySelector('button').addEventListener('click', () => {
      showShowtimesForMovie(m);
    });
    $list.appendChild(div);
  });
  } catch (err) {
    $list.innerHTML = '<div class="muted">Failed to load movies.</div>';
    showToast('Failed to load movies', 'error');
  }
}

// Store current movie for navigation
let currentMovie = null;

async function showShowtimesForMovie(movie) {
  currentMovie = movie;
  const movieInfo = $('#selected-movie-info');
  if (movieInfo) {
    movieInfo.innerHTML = `
      <div style="display:flex;gap:20px;align-items:start">
        ${movie.imageUrl ? `<img src="${movie.imageUrl}" alt="${movie.title}" style="width:150px;height:225px;object-fit:cover;border-radius:8px;flex-shrink:0" onerror="this.style.display='none'">` : ''}
        <div style="flex:1">
          <h2 style="margin:0 0 8px 0;color:var(--primary)">${movie.title}</h2>
          <div style="margin-bottom:6px"><span class="badge" style="background:#22c55e;color:#fff">${movie.genre || 'Drama'}</span> <span class="muted">${movie.language}</span></div>
          <div class="muted">${movie.description || 'No description'}</div>
          <div style="margin-top:8px" class="muted"><b>${movie.duration} mins</b> · ⭐ ${movie.rating ?? 0}/5</div>
        </div>
      </div>
    `;
  }
  
  await loadShowtimes(movie._id);
  showSection('showtime');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadShowtimes(movieId) {
  const $list = $('#showtimes');
  if (!$list) return;
  $list.innerHTML = '<div class="muted">Loading showtimes...</div>';
  try {
    const sts = await api.showtimes(movieId);
    $list.innerHTML = '';
    if (!sts || sts.length === 0) {
      $list.innerHTML += '<div class="muted">No showtimes available for this movie.</div>';
      return;
    }
    sts.forEach(s => {
    const div = document.createElement('div');
    div.className = 'card';
    const when = new Date(s.showTime);
    const theatre = s.theatreId || {};
    const availableSeats = s.totalSeats - (s.bookedSeats?.length || 0);
    
    div.innerHTML = `
      <div style="margin-bottom:8px"><strong>${theatre.name || 'Theatre'}</strong></div>
      <div class="muted" style="margin-bottom:8px">${theatre.location || ''}</div>
      <div style="margin-bottom:8px"><strong>${when.toLocaleDateString()} at ${when.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong></div>
      <div style="margin-bottom:12px">
        ${availableSeats > 0 ? 
          `<span style="color:#22c55e;font-weight:600">✓ ${availableSeats} seats available</span>` :
          `<span style="color:#dc2626;font-weight:600">✗ Sold Out</span>`
        }
        <span class="muted"> (${s.totalSeats} total)</span>
      </div>
      <button class=\"btn\" data-id=\"${s._id}\" ${availableSeats === 0 ? 'disabled' : ''}>🎫 Select Seats</button>
    `;
    div.querySelector('button').addEventListener('click', () => {
      const showtimeInput = $('#booking-showtime-id');
      if (showtimeInput) showtimeInput.value = s._id;
      // Load seat map for this showtime
      loadSeatMap(s);
      // Switch to Book tab
      showSection('book');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $list.appendChild(div);
  });
  } catch (err) {
    $list.innerHTML = '<div class="muted">Failed to load showtimes.</div>';
    showToast('Failed to load showtimes', 'error');
  }
}

function loadSeatMap(showtime) {
  const seatSelector = $('#seat-selector');
  const showtimeInfo = $('#showtime-info');
  const seatsInput = $('#booking-seats');
  
  if (!seatSelector || !showtimeInfo || !seatsInput) return;
  
  // Display showtime info
  const when = new Date(showtime.showTime);
  const theatre = showtime.theatreId || {};
  showtimeInfo.style.display = 'block';
  showtimeInfo.innerHTML = `
    <div><strong>${theatre.name || 'Theatre'}</strong> - ${theatre.location || ''}</div>
    <div style="margin-top:6px">${when.toLocaleDateString()} at ${when.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
  `;
  
  // Create seat grid in simple rows
  const bookedSeats = showtime.bookedSeats || [];
  const totalSeats = showtime.totalSeats;
  let selectedSeats = [];
  
  // Simple row-wise layout
  const seatsPerRow = 10;
  const rows = Math.ceil(totalSeats / seatsPerRow);
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  let html = '<div style="margin-bottom:16px">';
  html += '<div class="seat-legend"><span>🟢 Available</span><span>🔴 Booked</span><span>🔵 Selected</span></div>';
  
  let seatNumber = 1;
  for (let row = 0; row < rows; row++) {
    html += '<div class="seat-row">';
    html += `<div class="row-label">Row ${rowLabels[row]}</div>`;
    
    const seatsInThisRow = Math.min(seatsPerRow, totalSeats - seatNumber + 1);
    for (let seat = 0; seat < seatsInThisRow; seat++) {
      const isBooked = bookedSeats.includes(seatNumber);
      const seatClass = isBooked ? 'seat booked' : 'seat available';
      html += `<button type="button" class="${seatClass}" data-seat="${seatNumber}" ${isBooked ? 'disabled' : ''}>${seatNumber}</button>`;
      seatNumber++;
    }
    
    html += '</div>';
  }
  
  html += '</div>';
  seatSelector.innerHTML = html;
  
  // Add click handlers for seat selection
  seatSelector.querySelectorAll('.seat.available').forEach(btn => {
    btn.addEventListener('click', () => {
      const seatNum = parseInt(btn.dataset.seat);
      
      if (btn.classList.contains('selected')) {
        // Deselect
        btn.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s !== seatNum);
      } else {
        // Select
        btn.classList.add('selected');
        selectedSeats.push(seatNum);
      }
      
      // Update input and display
      selectedSeats.sort((a, b) => a - b);
      seatsInput.value = selectedSeats.join(',');
      
      // Update seat count display
      const seatsCountEl = $('#seats-count');
      const confirmBtn = $('#confirm-booking-btn');
      if (selectedSeats.length > 0) {
        if (seatsCountEl) seatsCountEl.innerHTML = `<b>${selectedSeats.join(', ')}</b> (${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''})`;
        if (confirmBtn) confirmBtn.disabled = false;
      } else {
        if (seatsCountEl) seatsCountEl.textContent = 'None';
        if (confirmBtn) confirmBtn.disabled = true;
      }
    });
  });
}

function showMovieDetails(movie) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>🎬 ${movie.title}</h2>
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div style="margin-bottom:12px"><strong>Language:</strong> ${movie.language}</div>
        <div style="margin-bottom:12px"><strong>Genre:</strong> ${movie.genre || 'Drama'}</div>
        <div style="margin-bottom:12px"><strong>Duration:</strong> ${movie.duration} minutes</div>
        <div style="margin-bottom:12px"><strong>Rating:</strong> ${movie.rating ?? 0}/5 ⭐</div>
        <div style="margin-bottom:12px"><strong>Description:</strong></div>
        <p>${movie.description || 'No description available.'}</p>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="this.closest('.modal').remove(); document.querySelector('[data-id=\"${movie._id}\"][data-action=\"showtimes\"]')?.click()">View Showtimes</button>
        <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

async function loadMyBookings() {
  const $list = $('#bookings-list');
  if (!$list) return;
  const token = localStorage.getItem('token');
  if (!token) {
    $list.innerHTML = '<div class="muted">Please login to view bookings.</div>';
    return;
  }
  $list.innerHTML = '<div class="muted">Loading your bookings...</div>';
  try {
    const bookings = await api.getMyBookings(token);
    $list.innerHTML = '';
    if (!bookings || bookings.length === 0) {
      $list.innerHTML = '<div class="muted">No bookings yet. Start browsing movies!</div>';
      return;
    }
    bookings.forEach(b => {
      const div = document.createElement('div');
      div.className = 'card';
      const date = new Date(b.bookedAt || b.createdAt || Date.now());
      const show = b.showId || {};
      const movie = show.movieId || {};
      const theatre = show.theatreId || {};
      const showDate = show.showTime ? new Date(show.showTime).toLocaleString() : 'N/A';
      div.innerHTML = `
        <div style="margin-bottom:6px"><b>Booking #${b._id?.slice(-6) || 'N/A'}</b> · <span class="badge">${b.status || 'CONFIRMED'}</span></div>
        <div style="margin-bottom:6px"><b>${movie.title || 'Movie'}</b> at ${theatre.name || 'Theatre'}</div>
        <div style="margin-bottom:6px" class="muted">${theatre.location || ''} · ${showDate}</div>
        <div style="margin-bottom:6px">Seats: <b>${(b.seats || []).join(', ')}</b></div>
        <div style="margin-bottom:6px">Total Price: <b>₹${b.totalPrice || 0}</b></div>
        <div class="muted">Booked on: ${date.toLocaleString()}</div>
      `;
      $list.appendChild(div);
    });
  } catch (err) {
    $list.innerHTML = '<div class="muted">Failed to load bookings.</div>';
    showToast('Failed to load bookings', 'error');
  }
}

// Register
const registerForm = $('#register-form');
if (registerForm) registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('#reg-name').value.trim();
  const email = $('#reg-email').value.trim();
  const password = $('#reg-pass').value;
  
  // Validation
  if (!name || name.length < 2) {
    showToast('Name must be at least 2 characters.', 'error');
    return;
  }
  if (!email || !email.includes('@') || !email.includes('.')) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }
  
  const res = await api.register(name, email, password);
  if (res && res.email) {
    showToast('Registration successful! Redirecting to login...', 'success');
    setTimeout(() => window.location.href = '/', 1500);
  } else if (res && res.message) {
    showToast(res.message, 'error');
  }
});

// Login
const loginForm = $('#login-form');
if (loginForm) loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const password = $('#login-pass').value;
  const loginResult = $('#login-result');
  
  // Clear previous error
  if (loginResult) loginResult.textContent = '';
  
  // Validation
  if (!email || !password) {
    showToast('Please enter both email and password.', 'error');
    if (loginResult) loginResult.textContent = 'Please enter both email and password.';
    return;
  }
  
  try {
    const res = await api.login(email, password);
    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('email', res.user?.email || email);
      setAuthState();
      showToast('Logged in successfully.', 'success');
      enterDashboard();
    } else {
      // Handle error response
      const errorMessage = res.message || 'Invalid email or password';
      showToast(errorMessage, 'error');
      if (loginResult) loginResult.textContent = errorMessage;
    }
  } catch (err) {
    showToast('Login failed. Please try again.', 'error');
    if (loginResult) loginResult.textContent = 'Login failed. Please try again.';
  }
});

// Booking
const bookingForm = $('#booking-form');
if (bookingForm) bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    const bookingRes = $('#booking-result');
    if (bookingRes) bookingRes.textContent = 'Please login first.';
    showToast('Please login to book.', 'error');
    return;
  }
  const showId = $('#booking-showtime-id').value.trim();
  const seatsStr = $('#booking-seats').value.trim();
  const seats = seatsStr.split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
  
  if (!showId || seats.length === 0) {
    showToast('Please select a show and seats', 'error');
    return;
  }
  
  const res = await api.book(token, showId, seats);
  const bookingRes = $('#booking-result');
  if (bookingRes) bookingRes.textContent = JSON.stringify(res, null, 2);
  
  if (res.status === 201) {
    showToast('🎉 Booking confirmed!', 'success');
    // Clear form and seat selection
    e.target.reset();
    const seatsCountEl = $('#seats-count');
    if (seatsCountEl) seatsCountEl.textContent = 'None';
    // Navigate to My Bookings immediately
    setTimeout(() => showSection('mybookings'), 1500);
  } else {
    showToast(res.body?.message || 'Booking failed.', 'error');
  }
});

function enterDashboard() {
  // switch views
  const landing = $('#landing-section');
  const dash = $('#dashboard-section');
  if (landing) {
    landing.classList.add('hidden');
    landing.style.display = 'none';
  }
  if (dash) {
    dash.classList.remove('hidden');
    dash.style.display = 'block';
  }
  // Show browse by default
  showSection('browse');
  setAuthState();
  // load movies only if on dashboard page
  if ($('#movies')) {
    loadMovies();
    const showtimesList = $('#showtimes');
    if (showtimesList) showtimesList.innerHTML = '<div class="muted">Select a movie to view showtimes.</div>';
  }
}

function showSection(section) {
  // Hide all sections
  const browse = $('#browse-section');
  const showtime = $('#showtime-section');
  const book = $('#book-section');
  const mybookings = $('#mybookings-section');
  const navHome = $('#nav-home');
  const navMyBookings = $('#nav-mybookings');
  
  if (browse) browse.classList.add('hidden');
  if (showtime) showtime.classList.add('hidden');
  if (book) book.classList.add('hidden');
  if (mybookings) mybookings.classList.add('hidden');
  if (navHome) navHome.classList.remove('active');
  if (navMyBookings) navMyBookings.classList.remove('active');
  
  // Show requested section
  if (section === 'browse' || section === 'home') {
    if (browse) browse.classList.remove('hidden');
    if (navHome) navHome.classList.add('active');
  } else if (section === 'showtime') {
    if (showtime) showtime.classList.remove('hidden');
  } else if (section === 'book') {
    if (book) book.classList.remove('hidden');
  } else if (section === 'mybookings') {
    if (mybookings) mybookings.classList.remove('hidden');
    if (navMyBookings) navMyBookings.classList.add('active');
    loadMyBookings();
  }
}

function enterLanding() {
  const landing = $('#landing-section');
  const dash = $('#dashboard-section');
  if (landing) {
    landing.classList.remove('hidden');
    landing.style.display = 'block';
  }
  if (dash) {
    dash.classList.add('hidden');
    dash.style.display = 'none';
  }
}

// Dashboard nav
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'nav-home') {
    e.preventDefault();
    showSection('browse');
  } else if (e.target && e.target.id === 'nav-mybookings') {
    e.preventDefault();
    showSection('mybookings');
  } else if (e.target && e.target.id === 'btn-back-to-movies') {
    e.preventDefault();
    showSection('browse');
  } else if (e.target && e.target.id === 'btn-back-to-showtimes') {
    e.preventDefault();
    if (currentMovie) {
      showShowtimesForMovie(currentMovie);
    } else {
      showSection('browse');
    }
  } else if (e.target && e.target.id === 'btn-back-to-movies-from-bookings') {
    e.preventDefault();
    showSection('browse');
  }
});

// Logout
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'btn-logout') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const shouldLogout = isLocalhost || confirm('Are you sure you want to logout?');
    
    if (shouldLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      setAuthState();
      showToast('Logged out successfully.', 'info');
      enterLanding();
    }
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Escape key to clear booking form when in Book section
  if (e.key === 'Escape') {
    const bookSection = $('#book-section');
    if (bookSection && !bookSection.classList.contains('hidden')) {
      const bookingForm = $('#booking-form');
      if (bookingForm) bookingForm.reset();
      showToast('Form cleared', 'info');
    }
  }
});

// Initial view: landing unless already signed in
(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // Verify token exists and show dashboard
    enterDashboard();
  } else {
    // No token, show landing
    enterLanding();
  }
})();

// Add global logout function accessible from console for debugging
window.forceLogout = () => {
  localStorage.clear();
  location.reload();
};
