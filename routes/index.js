const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Admin = require('../models/Admin');
const upload = require('../middleware/upload');

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Get Register Form
// Displays the registration page for new users.
router.get('/register', (req, res) => {
  try {
    res.render('register', { title: 'Create Account', isAuthPage: true });
  } catch (error) {
    console.error('Error loading register page:', error);
    res.status(500).render('register', { title: 'Create Account', error: 'An error occurred', isAuthPage: true });
  }
});

// Post Register Form
// Processes user registration with validation and error handling.
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword, userType, city, agreeTerms } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword || !userType) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'All required fields must be filled',
        isAuthPage: true
      });
    }

    // Password match check
    if (password !== confirmPassword) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'Passwords do not match',
        isAuthPage: true
      });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'Password must be at least 6 characters long',
        isAuthPage: true
      });
    }

    // Phone number validation (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'Please enter a valid 10-digit phone number',
        isAuthPage: true
      });
    }

    // Terms agreement check
    if (!agreeTerms) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'You must agree to the terms and conditions',
        isAuthPage: true
      });
    }

    // Check if user already exists
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).render('register', {
        title: 'Create Account',
        error: 'Email already registered. Please use a different email or try logging in.',
        isAuthPage: true
      });
    }

    // Create new user
    const newUser = await User.createUser({
      fullName,
      email: email.toLowerCase(),
      phone,
      password, // In production, this should be hashed using bcrypt
      userType,
      city
    });

    console.log('User registered successfully:', newUser._id);

    // Auto-login user after registration
    req.session.userId = newUser._id;
    req.session.userName = newUser.fullName;
    req.session.userEmail = newUser.email;

    // Redirect to home page
    res.redirect('/');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).render('register', {
      title: 'Create Account',
      error: 'An error occurred during registration. Please try again.',
      isAuthPage: true
    });
  }
});

// Get Login Form
// Displays the login page for existing users.
router.get('/login', (req, res) => {
  try {
    res.render('login', { title: 'Sign In', isAuthPage: true });
  } catch (error) {
    console.error('Error loading login page:', error);
    res.status(500).render('login', { title: 'Sign In', error: 'An error occurred', isAuthPage: true });
  }
});

// Post Login Form
// Processes user login with email and password verification, or admin login with username and password.
router.post('/login', async (req, res) => {
  try {
    const { loginType = 'user', email, username, password, rememberMe } = req.body;

    if (loginType === 'admin') {
      // Admin Login
      if (!username || !password) {
        return res.status(400).render('login', {
          title: 'Sign In',
          error: 'Admin username and password are required',
          isAuthPage: true
        });
      }

      // Find admin by username
      const admin = await Admin.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).render('login', {
          title: 'Sign In',
          error: 'Invalid admin credentials',
          isAuthPage: true
        });
      }

      // Check password (in production, use bcrypt.compare)
      if (admin.password !== password) {
        return res.status(401).render('login', {
          title: 'Sign In',
          error: 'Invalid admin credentials',
          isAuthPage: true
        });
      }

      // Set admin session
      req.session.adminId = admin._id;
      req.session.adminUsername = admin.username;
      req.session.adminRole = admin.role;
      req.session.isAdmin = true;

      console.log('Admin logged in successfully:', admin._id);

      // Redirect to admin portal
      res.redirect('/admin');
    } else {
      // User Login
      if (!email || !password) {
        return res.status(400).render('login', {
          title: 'Sign In',
          error: 'Email and password are required',
          isAuthPage: true
        });
      }

      // Find user by email
      const user = await User.getUserByEmail(email);
      if (!user) {
        return res.status(401).render('login', {
          title: 'Sign In',
          error: 'Invalid email or password',
          isAuthPage: true
        });
      }

      // Check password (in production, use bcrypt.compare)
      if (user.password !== password) {
        return res.status(401).render('login', {
          title: 'Sign In',
          error: 'Invalid email or password',
          isAuthPage: true
        });
      }

      // Set user session
      req.session = req.session || {};
      req.session.userId = user._id;
      req.session.userName = user.fullName;
      req.session.userEmail = user.email;
      req.session.isAdmin = false;

      console.log('User logged in successfully:', user._id);

      // Redirect to home page
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).render('login', {
      title: 'Sign In',
      error: 'An error occurred during login. Please try again.',
      isAuthPage: true
    });
  }
});

// Logout Route
// Clears user/admin session and redirects to login page.
router.get('/logout', (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/login');
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).send('An error occurred during logout');
  }
});

// ============================================================================
// ROOM & BOOKING ROUTES
// ============================================================================

// Home Page - Redirect to login if not authenticated
// Loads available rooms and renders the landing page with featured listings.
router.get('/', async (req, res) => {
  try {
    // If not logged in, redirect to login page
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }

    const rooms = await Room.getAvailableRooms();
    const featuredRooms = rooms.slice(0, 3);
    res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms: featuredRooms });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms: [] });
  }
});

// All Rooms Page
// Displays the room catalog, optionally filtering by type, price, and search text.
router.get('/rooms', async (req, res) => {
  try {
    const { type = '', search: searchQuery = '' } = req.query;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice, 10) : NaN;
    const search = searchQuery.toLowerCase().trim();
    
    const rooms = await Room.getAvailableRooms();
    
    const filteredRooms = rooms.filter(room => {
      const typeMatch = !type || room.type === type;
      const priceMatch = isNaN(maxPrice) || room.monthlyPrice <= maxPrice;
      const searchMatch = !search || room.name.toLowerCase().includes(search) || room.description.toLowerCase().includes(search);
      return typeMatch && priceMatch && searchMatch;
    });

    res.render('rooms', { title: 'Browse Rooms', rooms: filteredRooms, query: req.query });
  } catch (error) {
    console.error('Error loading rooms page:', error);
    res.render('rooms', { title: 'Browse Rooms', rooms: [], query: req.query });
  }
});

// Room Detail Page
// Shows the full room detail page for a single room.
router.get('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.getRoomById(req.params.id);
    if (!room) {
      return res.redirect('/rooms');
    }
    res.render('roomDetail', { title: room.name, room });
  } catch (error) {
    console.error('Error loading room detail:', error);
    res.redirect('/rooms');
  }
});

// Booking Form Page
// Displays the booking form for a selected room.
router.get('/book/:id', async (req, res) => {
  try {
    const room = await Room.getRoomById(req.params.id);
    if (!room) {
      return res.redirect('/rooms');
    }
    res.render('bookingForm', { title: 'Book Room', room });
  } catch (error) {
    console.error('Error loading booking form:', error);
    res.redirect('/rooms');
  }
});

// Submit Booking with Aadhar Upload
// Processes the booking form and creates a new booking record with file upload.
router.post('/book/:id', upload.single('aadharPdf'), async (req, res) => {
  try {
    const { guestName, email, phone, aadharNumber, checkIn, checkOut, guests } = req.body;
    
    console.log('Booking request received:', { guestName, email, phone, aadharNumber, roomId: req.params.id });
    
    // Validate Aadhar number
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      console.error('Invalid Aadhar number:', aadharNumber);
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }
      const room = await Room.getRoomById(req.params.id);
      return res.status(400).render('bookingForm', {
        title: 'Book Room',
        room: room,
        error: 'Aadhar number must be exactly 12 digits'
      });
    }

    const aadharPdf = req.file ? `/uploads/aadhar/${req.file.filename}` : null;
    
    console.log('Creating booking with:', { guestName, aadharNumber, roomId: req.params.id, aadharPdf });
    
    const booking = await Booking.createBooking(
      guestName, 
      email, 
      phone, 
      aadharNumber,
      req.params.id, 
      checkIn, 
      checkOut, 
      guests, 
      aadharPdf
    );
    
    if (!booking) {
      console.error('Booking creation failed - booking is null');
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }
      const room = await Room.getRoomById(req.params.id);
      return res.status(400).render('bookingForm', {
        title: 'Book Room',
        room: room,
        error: 'Failed to create booking. Please verify room details and try again.'
      });
    }
    
    console.log('Booking created successfully:', booking._id);
    res.redirect(`/confirmation/${booking._id}`);
  } catch (error) {
    console.error('Error creating booking:', error);
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }
    try {
      const room = await Room.getRoomById(req.params.id);
      return res.status(500).render('bookingForm', {
        title: 'Book Room',
        room: room,
        error: 'An error occurred while creating your booking. Please try again.'
      });
    } catch (e) {
      return res.redirect('/rooms');
    }
  }
});

// Confirmation Page
// Shows a confirmation message and booking details after a successful reservation.
router.get('/confirmation/:id', async (req, res) => {
  try {
    const booking = await Booking.getBookingById(req.params.id);
    if (!booking) {
      return res.redirect('/rooms');
    }
    
    res.render('confirmation', { title: 'Booking Confirmed!', booking });
  } catch (error) {
    console.error('Error loading confirmation:', error);
    res.redirect('/rooms');
  }
});

// View Aadhar PDF
// Serves the uploaded Aadhar PDF for viewing/downloading.
router.get('/view-aadhar/:id', async (req, res) => {
  try {
    const booking = await Booking.getBookingById(req.params.id);
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

// My Bookings Page
// Displays all bookings with room details.
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.getAllBookings();
    res.render('bookings', { title: 'My Bookings', bookings });
  } catch (error) {
    console.error('Error loading bookings:', error);
    res.render('bookings', { title: 'My Bookings', bookings: [] });
  }
});

module.exports = router;
