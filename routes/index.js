const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');


// Home Page
// Loads available rooms and renders the landing page with featured listings.
router.get('/', (req, res) => {
  const rooms = Room.getAvailableRooms();
  const featuredRooms = rooms.slice(0, 3);
  res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms: featuredRooms });
});

// All Rooms Page
// Displays the room catalog, optionally filtering by type, price, and search text.
router.get('/rooms', (req, res) => {
  const { type = '', search: searchQuery = '' } = req.query;
  const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice, 10) : NaN;
  const search = searchQuery.toLowerCase().trim();
  
  const rooms = Room.getAvailableRooms();
  
  const filteredRooms = rooms.filter(room => {
    const typeMatch = !type || room.type === type;
    const priceMatch = isNaN(maxPrice) || room.monthlyPrice <= maxPrice;
    const searchMatch = !search || room.name.toLowerCase().includes(search) || room.description.toLowerCase().includes(search);
    return typeMatch && priceMatch && searchMatch;
  });

  res.render('rooms', { title: 'Browse Rooms', rooms: filteredRooms, query: req.query });
});

// Room Detail Page
// Shows the full room detail page for a single room.
router.get('/rooms/:id', (req, res) => {
  const room = Room.getRoomById(req.params.id);
  if (!room) {
    return res.redirect('/rooms');
  }
  res.render('roomDetail', { title: room.name, room });
});

// Booking Form Page
// Displays the booking form for a selected room.
router.get('/book/:id', (req, res) => {
  const room = Room.getRoomById(req.params.id);
  if (!room) {
    return res.redirect('/rooms');
  }
  res.render('bookingForm', { title: 'Book Room', room });
});

// Submit Booking
// Processes the booking form and creates a new booking record.
router.post('/book/:id', (req, res) => {
  const { guestName, email, phone, checkIn, checkOut, guests, months = 1 } = req.body;
  
  const booking = Booking.createBooking(guestName, email, phone, req.params.id, checkIn, checkOut, guests, months);
  
  if (!booking) {
    return res.redirect('/rooms');
  }
  
  res.redirect(`/confirmation/${booking._id}`);
});

// Confirmation Page
// Shows a confirmation message and booking details after a successful reservation.
router.get('/confirmation/:id', (req, res) => {
  const booking = Booking.getBookingById(req.params.id);
  if (!booking) {
    return res.redirect('/rooms');
  }
  
  const room = Room.getRoomById(booking.room);
  const bookingWithRoom = {
    _id: booking._id,
    guestName: booking.guestName,
    email: booking.email,
    phone: booking.phone,
    room,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    months: booking.months,
    monthlyRate: booking.monthlyRate,
    totalPrice: booking.totalPrice,
    utilities: booking.utilities,
    status: booking.status,
    createdAt: booking.createdAt
  };
  
  res.render('confirmation', { title: 'Booking Confirmed!', booking: bookingWithRoom });
});

// My Bookings Page
// Displays all bookings and attaches room details to each booking record.
router.get('/bookings', (req, res) => {
  const bookings = Booking.getAllBookings();
  
  const bookingsWithRooms = bookings.map(booking => ({
    _id: booking._id,
    guestName: booking.guestName,
    email: booking.email,
    phone: booking.phone,
    room: Room.getRoomById(booking.room),
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    months: booking.months,
    monthlyRate: booking.monthlyRate,
    totalPrice: booking.totalPrice,
    utilities: booking.utilities,
    status: booking.status,
    createdAt: booking.createdAt
  }));
  
  res.render('bookings', { title: 'My Bookings', bookings: bookingsWithRooms });
});

module.exports = router;
