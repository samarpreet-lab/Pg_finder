const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// GET /admin — Dashboard
router.get('/', (req, res) => {
  const rooms = Room.getAllRooms();
  const bookings = Booking.getAllBookings();
  const recentBookings = Booking.getRecentBookings(5);
  const revenue = Booking.calculateRevenue();

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    totalRooms: rooms.length,
    totalBookings: bookings.length,
    revenue,
    recentBookings,
    footerClass: 'admin-footer',
    isAdmin: true
  });
});

// GET /admin/rooms — All Rooms
router.get('/rooms', (req, res) => {
  const rooms = Room.getAllRooms();
  res.render('admin/rooms', { title: 'Manage Rooms', rooms, footerClass: 'admin-footer', isAdmin: true });
});

// GET /admin/rooms/new — Add Room Form
router.get('/rooms/new', (req, res) => {
  res.render('admin/addRoom', { title: 'Add New Room', room: null, footerClass: 'admin-footer', isAdmin: true });
});

// POST /admin/rooms — Save New Room
router.post('/rooms', (req, res) => {
  const { name, type, monthlyPrice, description, image, amenities, rating, electricityStatus, waterStatus } = req.body;
  const amenitiesArr = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : ['WiFi']);
  const utilities = {
    electricity: electricityStatus || 'separate',
    water: waterStatus || 'included',
    description: `Electricity ${electricityStatus || 'separate'}, Water ${waterStatus || 'included'}`
  };
  
  Room.addRoom(name, type, monthlyPrice, description, image || 'https://via.placeholder.com/400x250?text=Room+Image', amenitiesArr, utilities, rating || 4.0);
  res.redirect('/admin/rooms');
});

// GET /admin/rooms/:id/edit — Edit Room Form
router.get('/rooms/:id/edit', (req, res) => {
  const room = Room.getRoomById(req.params.id);
  res.render('admin/addRoom', { title: 'Edit Room', room, footerClass: 'admin-footer', isAdmin: true });
});

// PUT /admin/rooms/:id — Update Room
router.put('/rooms/:id', (req, res) => {
  const { name, type, monthlyPrice, description, image, amenities, rating, isAvailable, electricityStatus, waterStatus } = req.body;
  const amenitiesArr = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : ['WiFi']);
  const utilities = {
    electricity: electricityStatus || 'separate',
    water: waterStatus || 'included',
    description: `Electricity ${electricityStatus || 'separate'}, Water ${waterStatus || 'included'}`
  };
  
  Room.updateRoom(req.params.id, name, type, monthlyPrice, description, image, amenitiesArr, isAvailable === 'on', utilities, rating);
  res.redirect('/admin/rooms');
});

// DELETE /admin/rooms/:id — Delete Room
router.delete('/rooms/:id', (req, res) => {
  Room.deleteRoom(req.params.id);
  res.redirect('/admin/rooms');
});

// GET /admin/bookings — All Bookings
router.get('/bookings', (req, res) => {
  const data = Booking.loadData();
  const bookings = Booking.getRecentBookings(100).map(b => ({
    ...b,
    room: data.rooms.find(r => r._id === b.room)
  }));
  res.render('admin/bookings', { title: 'Manage Bookings', bookings, footerClass: 'admin-footer', isAdmin: true });
});

// PUT /admin/bookings/:id — Update Booking Status
router.put('/bookings/:id', (req, res) => {
  Booking.updateBookingStatus(req.params.id, req.body.status);
  res.redirect('/admin/bookings');
});

module.exports = router;
