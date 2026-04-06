const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// GET / — Landing Page
router.get('/', (req, res) => {
  const rooms = Room.getAvailableRooms().slice(0, 3);
  res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms });
});

// GET /rooms — All Rooms with Filter
router.get('/rooms', (req, res) => {
  const { type, maxPrice } = req.query;
  let rooms = Room.getAvailableRooms();
  
  if (type) {
    rooms = rooms.filter(r => r.type === type);
  }
  if (maxPrice) {
    rooms = rooms.filter(r => r.price <= parseInt(maxPrice));
  }

  res.render('rooms', { title: 'Browse Rooms', rooms, query: req.query });
});

// GET /rooms/:id — Room Detail
router.get('/rooms/:id', (req, res) => {
  const room = Room.getRoomById(req.params.id);
  if (!room) return res.redirect('/rooms');
  res.render('roomDetail', { title: room.name, room });
});

// GET /book/:id — Booking Form
router.get('/book/:id', (req, res) => {
  const room = Room.getRoomById(req.params.id);
  if (!room) return res.redirect('/rooms');
  res.render('bookingForm', { title: 'Book Room', room });
});

// POST /book/:id — Submit Booking
router.post('/book/:id', (req, res) => {
  const { guestName, email, phone, checkIn, checkOut, guests, months } = req.body;
  const booking = Booking.createBooking(guestName, email, phone, req.params.id, checkIn, checkOut, guests, months || 1);
  
  if (!booking) {
    return res.redirect('/rooms');
  }
  
  res.redirect(`/confirmation/${booking._id}`);
});

// GET /confirmation/:id — Confirmation Page
router.get('/confirmation/:id', (req, res) => {
  const booking = Booking.getBookingById(req.params.id);
  if (!booking) return res.redirect('/rooms');
  
  const room = Room.getRoomById(booking.room);
  const bookingWithRoom = { ...booking, room };
  
  res.render('confirmation', { title: 'Booking Confirmed!', booking: bookingWithRoom });
});

// GET /bookings — All User Bookings
router.get('/bookings', (req, res) => {
  const bookings = Booking.getAllBookings();
  const bookingsWithRooms = bookings.map(booking => ({
    ...booking,
    room: Room.getRoomById(booking.room)
  }));
  res.render('bookings', { title: 'My Bookings', bookings: bookingsWithRooms });
});

module.exports = router;
