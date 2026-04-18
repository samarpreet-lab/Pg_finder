const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Admin = require('../models/Admin');
const upload = require('../middleware/upload');
const protect = require('../middleware/auth');

// ====== REGISTER PAGE ======
// Show the registration form to new users.
router.get('/register', (req, res) => {
  res.render('register', { title: 'Create Account', isAuthPage: true });
});

// ====== REGISTER SUBMISSION ======
// Create a new user account after validating all the form fields.
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword, userType, city, agreeTerms } = req.body;

    // Step 1: Check all required fields are filled
    if (!fullName || !email || !phone || !password || !confirmPassword || !userType) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'All required fields must be filled',
        isAuthPage: true
      });
    }

    // Step 2: Check passwords match
    if (password !== confirmPassword) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'Passwords do not match',
        isAuthPage: true
      });
    }

    // Step 3: Check password is long enough
    if (password.length < 6) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'Password must be at least 6 characters long',
        isAuthPage: true
      });
    }

    // Step 4: Check phone is 10 digits
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'Please enter a valid 10-digit phone number',
        isAuthPage: true
      });
    }

    // Step 5: Check user agreed to terms
    if (!agreeTerms) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'You must agree to the terms and conditions',
        isAuthPage: true
      });
    }

    // Step 6: Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'Email already registered. Please use a different email or try logging in.',
        isAuthPage: true
      });
    }

    // Step 7: Create the new user
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password,
      userType,
      city
    });

    // Step 8: Log the user in automatically by saving to session
    req.session.userId = newUser._id;
    req.session.userName = newUser.fullName;
    req.session.userEmail = newUser.email;

    // Step 9: Redirect to home
    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('register', {
      title: 'Create Account',
      error: 'An error occurred during registration. Please try again.',
      isAuthPage: true
    });
  }
});

// ====== LOGIN PAGE ======
// Show the login form to users.
router.get('/login', (req, res) => {
  res.render('login', { title: 'Sign In', isAuthPage: true });
});

// ====== LOGIN SUBMISSION ======
// Check the email/password or username/password and create a session.
router.post('/login', async (req, res) => {
  try {
    const { loginType = 'user', email, username, password } = req.body;

    // ====== ADMIN LOGIN PATH ======
    if (loginType === 'admin') {
      // Step 1: Check username and password are provided
      if (!username || !password) {
        return res.status(400).render('login', {
          title: 'Sign In',
          error: 'Admin username and password are required',
          isAuthPage: true
        });
      }

      // Step 2: Find admin by username
      const admin = await Admin.findOne({ username: username.toLowerCase(), isActive: true });
      if (!admin) {
        return res.status(401).render('login', {
          title: 'Sign In',
          error: 'Invalid admin credentials',
          isAuthPage: true
        });
      }

      // Step 3: Check password matches
      if (admin.password !== password) {
        return res.status(401).render('login', {
          title: 'Sign In',
          error: 'Invalid admin credentials',
          isAuthPage: true
        });
      }

      // Step 4: Save admin to session and redirect
      req.session.adminId = admin._id;
      req.session.adminUsername = admin.username;
      req.session.adminRole = admin.role;
      req.session.isAdmin = true;
      res.redirect('/admin');
      return;
    }

    // ====== REGULAR USER LOGIN PATH ======
    // Step 1: Check email and password are provided
    if (!email || !password) {
      return res.status(400).render('login', {
        title: 'Sign In',
        error: 'Email and password are required',
        isAuthPage: true
      });
    }

    // Step 2: Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).render('login', {
        title: 'Sign In',
        error: 'Invalid email or password',
        isAuthPage: true
      });
    }

    // Step 3: Check password matches
    if (user.password !== password) {
      return res.status(401).render('login', {
        title: 'Sign In',
        error: 'Invalid email or password',
        isAuthPage: true
      });
    }

    // Step 4: Save user to session and redirect
    req.session.userId = user._id;
    req.session.userName = user.fullName;
    req.session.userEmail = user.email;
    req.session.isAdmin = false;
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', {
      title: 'Sign In',
      error: 'An error occurred during login. Please try again.',
      isAuthPage: true
    });
  }
});

// ====== LOGOUT ======
// Clear the user session and send to login page.
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ====== HOME PAGE ======
// Show the landing page with 3 featured available rooms.
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true }).limit(3);
    res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms });
  } catch (error) {
    console.error('Error loading home:', error);
    res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms: [] });
  }
});

// ====== ALL ROOMS PAGE ======
// Display all available rooms with optional filters: type, price, and search text.
router.get('/rooms', protect, async (req, res) => {
  try {
    const { type = '', search: searchQuery = '' } = req.query;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice, 10) : NaN;
    const search = searchQuery.toLowerCase().trim();

    // Step 1: Get all available rooms from database
    const rooms = await Room.find({ isAvailable: true });

    // Step 2: Filter rooms based on query parameters
    const filteredRooms = rooms.filter(room => {
      const typeMatch = !type || room.type === type;
      const priceMatch = isNaN(maxPrice) || room.monthlyPrice <= maxPrice;
      const searchMatch = !search || room.name.toLowerCase().includes(search) || room.description.toLowerCase().includes(search);
      return typeMatch && priceMatch && searchMatch;
    });

    // Step 3: Send filtered list to template
    res.render('rooms', { title: 'Browse Rooms', rooms: filteredRooms, query: req.query });
  } catch (error) {
    console.error('Error loading rooms:', error);
    res.render('rooms', { title: 'Browse Rooms', rooms: [], query: req.query });
  }
});

// ====== ROOM DETAIL PAGE ======
// Show full details of a single room, or redirect if not found.
router.get('/rooms/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.redirect('/rooms');
    res.render('roomDetail', { title: room.name, room });
  } catch (error) {
    console.error('Error loading room detail:', error);
    res.redirect('/rooms');
  }
});

// ====== BOOKING FORM PAGE ======
// Show the booking form for a specific room.
router.get('/book/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.redirect('/rooms');
    res.render('bookingForm', { title: 'Book Room', room });
  } catch (error) {
    console.error('Error loading booking form:', error);
    res.redirect('/rooms');
  }
});

// ====== SUBMIT BOOKING ======
// Accept booking form with Aadhar PDF upload and create a booking record.
router.post('/book/:id', protect, upload.single('aadharPdf'), async (req, res) => {
  try {
    const { guestName, email, phone, aadharNumber, checkIn, checkOut, guests } = req.body;

    // Step 1: Check room exists
    const room = await Room.findById(req.params.id);
    if (!room) {
      if (req.file) require('fs').unlinkSync(req.file.path);
      return res.redirect('/rooms');
    }

    // Step 2: Prepare booking data
    const aadharPdf = req.file ? `/uploads/aadhar/${req.file.filename}` : null;
    const bookingData = {
      guestName,
      email,
      phone,
      aadharNumber,
      aadharPdf,
      aadharUploadDate: aadharPdf ? new Date() : null,
      room: req.params.id,
      checkIn,
      checkOut,
      guests: parseInt(guests),
      monthlyRate: room.monthlyPrice,
      totalPrice: room.monthlyPrice,
      utilities: room.utilities,
      status: 'Pending'
    };

    // Step 3: Create the booking
    const booking = await Booking.create(bookingData);

    // Step 4: Redirect to confirmation page
    res.redirect(`/confirmation/${booking._id}`);
  } catch (error) {
    console.error('Booking error:', error);
    // Clean up uploaded file if there's an error
    if (req.file) require('fs').unlinkSync(req.file.path);

    try {
      const room = await Room.findById(req.params.id);
      res.status(400).render('bookingForm', {
        title: 'Book Room',
        room,
        error: error.message || 'An error occurred. Please try again.'
      });
    } catch (e) {
      res.redirect('/rooms');
    }
  }
});

// ====== CONFIRMATION PAGE ======
// Show booking confirmation details after successful reservation.
router.get('/confirmation/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.redirect('/rooms');
    res.render('confirmation', { title: 'Booking Confirmed!', booking });
  } catch (error) {
    console.error('Error loading confirmation:', error);
    res.redirect('/rooms');
  }
});

// ====== VIEW/DOWNLOAD AADHAR PDF ======
// Allow user to download their uploaded Aadhar PDF.
router.get('/view-aadhar/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || !booking.aadharPdf) {
      return res.status(404).send('Aadhar document not found');
    }

    const filePath = require('path').join(__dirname, '../public', booking.aadharPdf);
    res.download(filePath, `aadhar-${booking.aadharNumber}.pdf`);
  } catch (error) {
    console.error('Error downloading aadhar:', error);
    res.status(500).send('Error downloading document');
  }
});

// ====== MY BOOKINGS PAGE ======
// Show all bookings for the logged-in user with room details.
router.get('/bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('room').sort({ createdAt: -1 });
    res.render('bookings', { title: 'My Bookings', bookings });
  } catch (error) {
    console.error('Error loading bookings:', error);
    res.render('bookings', { title: 'My Bookings', bookings: [] });
  }
});

module.exports = router;
