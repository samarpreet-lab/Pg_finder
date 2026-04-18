const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const renderAdmin = (view, data, req, res) => res.render(view, { footerClass: 'admin-footer', isAdmin: true, ...data });
const redirectOnError = (res, view, error) => res.status(400).render(view, { footerClass: 'admin-footer', isAdmin: true, error: error.message });

// ====== DASHBOARD ======
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    const bookings = await Booking.find();
    const recentBookings = await Booking.find().populate('room').sort({ createdAt: -1 }).limit(5);
    const revenue = await Booking.aggregate([{ $match: { status: 'Confirmed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    
    renderAdmin('admin/dashboard', { title: 'Admin Dashboard', totalRooms: rooms.length, totalBookings: bookings.length, revenue: revenue[0]?.total || 0, recentBookings }, req, res);
  } catch (error) {
    renderAdmin('admin/dashboard', { title: 'Admin Dashboard', totalRooms: 0, totalBookings: 0, revenue: 0, recentBookings: [] }, req, res);
  }
});

// ====== ROOMS LIST ======
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    renderAdmin('admin/rooms', { title: 'Manage Rooms', rooms }, req, res);
  } catch (error) {
    renderAdmin('admin/rooms', { title: 'Manage Rooms', rooms: [] }, req, res);
  }
});

// ====== ADD ROOM FORM ======
router.get('/rooms/new', (req, res) => {
  renderAdmin('admin/addRoom', { title: 'Add New Room', room: null }, req, res);
});

// ====== CREATE ROOM ======
router.post('/rooms', async (req, res) => {
  try {
    const amenitiesList = Array.isArray(req.body.amenities) ? req.body.amenities : (req.body.amenities ? [req.body.amenities] : ['WiFi']);
    await Room.create({
      name: req.body.name,
      type: req.body.type,
      monthlyPrice: parseInt(req.body.monthlyPrice),
      description: req.body.description,
      image: req.body.image || 'https://via.placeholder.com/400x250?text=Room+Image',
      amenities: amenitiesList,
      utilities: {
        electricity: req.body.electricityStatus || 'separate',
        water: req.body.waterStatus || 'included',
        description: `Electricity ${req.body.electricityStatus || 'separate'}, Water ${req.body.waterStatus || 'included'}`
      },
      isAvailable: req.body.isAvailable === 'on' || req.body.isAvailable === true,
      rating: parseFloat(req.body.rating) || 4.0
    });
    res.redirect('/admin/rooms');
  } catch (error) {
    redirectOnError(res, 'admin/addRoom', error);
  }
});

// ====== EDIT ROOM FORM ======
router.get('/rooms/:id/edit', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    renderAdmin('admin/addRoom', { title: 'Edit Room', room }, req, res);
  } catch (error) {
    res.redirect('/admin/rooms');
  }
});

// ====== UPDATE ROOM ======
router.post('/rooms/:id/update', async (req, res) => {
  try {
    const amenitiesList = Array.isArray(req.body.amenities) ? req.body.amenities : (req.body.amenities ? [req.body.amenities] : ['WiFi']);
    await Room.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      type: req.body.type,
      monthlyPrice: parseInt(req.body.monthlyPrice),
      description: req.body.description,
      image: req.body.image || 'https://via.placeholder.com/400x250?text=Room+Image',
      amenities: amenitiesList,
      utilities: {
        electricity: req.body.electricityStatus || 'separate',
        water: req.body.waterStatus || 'included',
        description: `Electricity ${req.body.electricityStatus || 'separate'}, Water ${req.body.waterStatus || 'included'}`
      },
      isAvailable: req.body.isAvailable === 'on' || req.body.isAvailable === true,
      rating: parseFloat(req.body.rating) || 4.0
    }, { runValidators: true });
    res.redirect('/admin/rooms');
  } catch (error) {
    const room = await Room.findById(req.params.id);
    renderAdmin('admin/addRoom', { title: 'Edit Room', room, error: error.message }, req, res);
  }
});

// ====== DELETE ROOM ======
router.post('/rooms/:id/delete', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.redirect('/admin/rooms');
  } catch (error) {
    res.redirect('/admin/rooms');
  }
});

// ====== BOOKINGS LIST ======
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('room').sort({ createdAt: -1 }).limit(100);
    renderAdmin('admin/bookings', { title: 'Manage Bookings', bookings }, req, res);
  } catch (error) {
    renderAdmin('admin/bookings', { title: 'Manage Bookings', bookings: [] }, req, res);
  }
});

// ====== BOOKING DETAILS ======
router.get('/bookings/:id/details', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.redirect('/admin/bookings');
    renderAdmin('admin/bookingDetails', { title: 'Booking Details', booking }, req, res);
  } catch (error) {
    res.redirect('/admin/bookings');
  }
});

// ====== DOWNLOAD AADHAR ======
router.get('/bookings/:id/aadhar/download', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking?.aadharPdf) throw new Error('Document not found');
    const filePath = require('path').join(__dirname, '../public', booking.aadharPdf);
    res.download(filePath, `Aadhar_${booking.guestName}_${booking._id}.pdf`);
  } catch (error) {
    res.status(404).send('Document not found');
  }
});

// ====== UPDATE BOOKING STATUS ======
router.post('/bookings/:id/update', async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect('/admin/bookings');
  } catch (error) {
    res.redirect('/admin/bookings');
  }
});

module.exports = router;
