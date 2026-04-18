const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const upload = require('../middleware/upload');
const protect = require('../middleware/auth');

// ====== REGISTER ======
router.get('/register', (req, res) => res.render('register', { title: 'Create Account', isAuthPage: true }));

router.post('/register', async (req, res) => {
  try {
    const { password, confirmPassword, agreeTerms } = req.body;
    if (password !== confirmPassword) throw new Error('Passwords do not match');
    if (!agreeTerms) throw new Error('You must agree to terms');
    
    const user = await User.create(req.body);
    req.session.userId = user._id;
    req.session.userName = user.fullName;
    req.session.userEmail = user.email;
    res.redirect('/');
  } catch (error) {
    res.status(400).render('register', { title: 'Create Account', error: error.message, isAuthPage: true });
  }
});

// ====== LOGIN ======
router.get('/login', (req, res) => res.render('login', { title: 'Sign In', isAuthPage: true }));

router.post('/login', async (req, res) => {
  try {
    const { loginType = 'user', email, username, password } = req.body;
    
    if (loginType === 'admin') {
      const admin = await Admin.findOne({ username: username?.toLowerCase(), isActive: true });
      if (!admin || admin.password !== password) throw new Error('Invalid credentials');
      req.session.adminId = admin._id;
      req.session.adminUsername = admin.username;
      req.session.adminRole = admin.role;
      req.session.isAdmin = true;
      return res.redirect('/admin');
    }
    
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.password !== password) throw new Error('Invalid credentials');
    req.session.userId = user._id;
    req.session.userName = user.fullName;
    req.session.userEmail = user.email;
    req.session.isAdmin = false;
    res.redirect('/');
  } catch (error) {
    res.status(401).render('login', { title: 'Sign In', error: error.message, isAuthPage: true });
  }
});

// ====== LOGOUT ======
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ====== HOME PAGE ======
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true }).limit(3);
    res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms });
  } catch (error) {
    res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms: [] });
  }
});

// ====== BROWSE ROOMS ======
router.get('/rooms', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true });
    const filteredRooms = rooms.filter(room => {
      const typeMatch = !req.query.type || room.type === req.query.type;
      const priceMatch = !req.query.maxPrice || room.monthlyPrice <= parseInt(req.query.maxPrice);
      const searchMatch = !req.query.search || room.name.toLowerCase().includes(req.query.search.toLowerCase());
      return typeMatch && priceMatch && searchMatch;
    });
    res.render('rooms', { title: 'Browse Rooms', rooms: filteredRooms, query: req.query });
  } catch (error) {
    res.render('rooms', { title: 'Browse Rooms', rooms: [], query: req.query });
  }
});

// ====== ROOM DETAIL ======
router.get('/rooms/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.redirect('/rooms');
    res.render('roomDetail', { title: room.name, room });
  } catch (error) {
    res.redirect('/rooms');
  }
});

// ====== BOOKING FORM ======
router.get('/book/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.redirect('/rooms');
    res.render('bookingForm', { title: 'Book Room', room });
  } catch (error) {
    res.redirect('/rooms');
  }
});

// ====== SUBMIT BOOKING ======
router.post('/book/:id', protect, upload.single('aadharPdf'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) throw new Error('Room not found');
    
    const booking = await Booking.create({
      ...req.body,
      room: req.params.id,
      aadharPdf: req.file ? `/uploads/aadhar/${req.file.filename}` : null,
      aadharUploadDate: req.file ? new Date() : null,
      monthlyRate: room.monthlyPrice,
      totalPrice: room.monthlyPrice,
      utilities: room.utilities,
      guests: parseInt(req.body.guests)
    });
    
    res.redirect(`/confirmation/${booking._id}`);
  } catch (error) {
    if (req.file) require('fs').unlinkSync(req.file.path);
    try {
      const room = await Room.findById(req.params.id);
      res.status(400).render('bookingForm', { title: 'Book Room', room, error: error.message });
    } catch (e) {
      res.redirect('/rooms');
    }
  }
});

// ====== CONFIRMATION ======
router.get('/confirmation/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.redirect('/rooms');
    res.render('confirmation', { title: 'Booking Confirmed!', booking });
  } catch (error) {
    res.redirect('/rooms');
  }
});

// ====== DOWNLOAD AADHAR ======
router.get('/view-aadhar/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking?.aadharPdf) throw new Error('Document not found');
    const filePath = require('path').join(__dirname, '../public', booking.aadharPdf);
    res.download(filePath, `aadhar-${booking.aadharNumber}.pdf`);
  } catch (error) {
    res.status(404).send('Document not found');
  }
});

// ====== MY BOOKINGS ======
router.get('/bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('room').sort({ createdAt: -1 });
    res.render('bookings', { title: 'My Bookings', bookings });
  } catch (error) {
    res.render('bookings', { title: 'My Bookings', bookings: [] });
  }
});

module.exports = router;
