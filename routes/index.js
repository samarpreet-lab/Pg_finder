const express = require('express');
const router = express.Router();
const [User, Admin, Room, Booking] = [require('../models/User'), require('../models/Admin'), require('../models/Room'), require('../models/Booking')];
const upload = require('../middleware/upload');
const protect = require('../middleware/auth');

// ====== REGISTER ======
router.route('/register')
  .get((req, res) => res.render('register', { title: 'Create Account', isAuthPage: true }))
  .post(async (req, res) => {
    try {
      if (req.body.password !== req.body.confirmPassword || !req.body.agreeTerms) throw new Error('Invalid input or terms not agreed');
      const user = await User.create(req.body);
      Object.assign(req.session, { userId: user._id, userName: user.fullName, userEmail: user.email, isAdmin: false });
      res.redirect('/');
    } catch (error) { res.status(400).render('register', { title: 'Create Account', error: error.message, isAuthPage: true }); }
  });

// ====== LOGIN ======
router.route('/login')
  .get((req, res) => res.render('login', { title: 'Sign In', isAuthPage: true }))
  .post(async (req, res) => {
    try {
      const { loginType = 'user', email, username, password } = req.body;
      if (loginType === 'admin') {
        const admin = await Admin.findOne({ username: username?.toLowerCase(), isActive: true });
        if (!admin || admin.password !== password) throw new Error('Invalid credentials');
        Object.assign(req.session, { adminId: admin._id, adminUsername: admin.username, adminRole: admin.role, isAdmin: true });
        return res.redirect('/admin');
      }
      const user = await User.findOne({ email: email?.toLowerCase() });
      if (!user || user.password !== password) throw new Error('Invalid credentials');
      Object.assign(req.session, { userId: user._id, userName: user.fullName, userEmail: user.email, isAdmin: false });
      res.redirect('/');
    } catch (error) { res.status(401).render('login', { title: 'Sign In', error: error.message, isAuthPage: true }); }
  });

// ====== LOGOUT ======
router.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

// ====== HOME & BROWSE ROOMS ======
router.get('/', protect, async (req, res) => {
  const rooms = await Room.find({ isAvailable: true }).limit(3).catch(() => []);
  res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms });
});

router.get('/rooms', protect, async (req, res) => {
  const rooms = await Room.find({ isAvailable: true }).catch(() => []);
  const filtered = rooms.filter(r => (!req.query.type || r.type === req.query.type) && (!req.query.maxPrice || r.monthlyPrice <= req.query.maxPrice));
  res.render('rooms', { title: 'Browse Rooms', rooms: filtered, query: req.query });
});

// ====== ROOM DETAIL & BOOKING ======
router.get('/rooms/:id', protect, async (req, res) => {
  const room = await Room.findById(req.params.id).catch(() => null);
  room ? res.render('roomDetail', { title: room.name, room }) : res.redirect('/rooms');
});

router.route('/book/:id')
  .all(protect)
  .get(async (req, res) => {
    const room = await Room.findById(req.params.id).catch(() => null);
    room ? res.render('bookingForm', { title: 'Book Room', room }) : res.redirect('/rooms');
  })
  .post(upload.single('aadharPdf'), async (req, res) => {
    try {
      console.log('📝 Booking request received:', { userId: req.session.userId, roomId: req.params.id });
      const room = await Room.findById(req.params.id);
      if (!room) {
        console.log('❌ Room not found:', req.params.id);
        throw new Error('Room not found');
      }
      console.log('✓ Room found:', room.name);
      
      const bookingData = {
        ...req.body,
        user: req.session.userId,
        room: room._id,
        aadharPdf: req.file ? `/uploads/aadhar/${req.file.filename}` : null,
        aadharUploadDate: req.file ? new Date() : null,
        monthlyRate: room.monthlyPrice,
        totalPrice: room.monthlyPrice,
        utilities: room.utilities,
        guests: parseInt(req.body.guests)
      };
      console.log('📦 Booking data:', bookingData);
      
      const booking = await Booking.create(bookingData);
      console.log('✅ Booking created successfully:', booking._id);
      res.redirect(`/confirmation/${booking._id}`);
    } catch (error) {
      console.error('❌ Booking error:', error.message);
      console.error('Stack:', error.stack);
      if (req.file) require('fs').unlinkSync(req.file.path);
      res.status(400).render('bookingForm', { 
        title: 'Book Room', 
        room: await Room.findById(req.params.id), 
        error: error.message 
      });
    }
  });

// ====== CONFIRMATION & DASHBOARD VIEWS ======
router.get('/confirmation/:id', protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room').catch(() => null);
  booking ? res.render('confirmation', { title: 'Booking Confirmed!', booking }) : res.redirect('/rooms');
});

router.get('/bookings', protect, async (req, res) => {
  try {
    console.log('📋 Fetching bookings for user:', req.session.userId);
    const bookings = await Booking.find({ user: req.session.userId }).populate('room').sort({ createdAt: -1 }).catch(() => []);
    console.log('✓ Bookings found:', bookings.length);
    bookings.forEach(b => console.log('  -', b._id, b.guestName, b.status));
    res.render('bookings', { title: 'My Bookings', bookings });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error.message);
    res.render('bookings', { title: 'My Bookings', bookings: [] });
  }
});

router.get('/view-aadhar/:id', protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id).catch(() => null);
  if (!booking?.aadharPdf) return res.status(404).send('Document not found');
  res.download(require('path').join(__dirname, '../public', booking.aadharPdf), `aadhar-${booking.aadharNumber}.pdf`);
});

module.exports = router;
