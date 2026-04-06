const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Home Page
router.get('/', function(req, res) {
  let rooms = Room.getAvailableRooms();
  let featuredRooms = [];
  for (let i = 0; i < 3 && i < rooms.length; i++) {
    featuredRooms.push(rooms[i]);
  }
  res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms: featuredRooms });
});

// All Rooms Page
router.get('/rooms', function(req, res) {
  let type = req.query.type;
  let maxPrice = req.query.maxPrice;
  let rooms = Room.getAvailableRooms();
  let filteredRooms = [];
  
  for (let i = 0; i < rooms.length; i++) {
    let include = true;
    
    if (type && rooms[i].type !== type) {
      include = false;
    }
    if (maxPrice && rooms[i].price > parseInt(maxPrice)) {
      include = false;
    }
    
    if (include) {
      filteredRooms.push(rooms[i]);
    }
  }

  res.render('rooms', { title: 'Browse Rooms', rooms: filteredRooms, query: req.query });
});

// Room Detail Page
router.get('/rooms/:id', function(req, res) {
  let room = Room.getRoomById(req.params.id);
  if (!room) {
    return res.redirect('/rooms');
  }
  res.render('roomDetail', { title: room.name, room: room });
});

// Booking Form Page
router.get('/book/:id', function(req, res) {
  let room = Room.getRoomById(req.params.id);
  if (!room) {
    return res.redirect('/rooms');
  }
  res.render('bookingForm', { title: 'Book Room', room: room });
});

// Submit Booking
router.post('/book/:id', function(req, res) {
  let guestName = req.body.guestName;
  let email = req.body.email;
  let phone = req.body.phone;
  let checkIn = req.body.checkIn;
  let checkOut = req.body.checkOut;
  let guests = req.body.guests;
  let months = req.body.months || 1;
  
  let booking = Booking.createBooking(guestName, email, phone, req.params.id, checkIn, checkOut, guests, months);
  
  if (!booking) {
    return res.redirect('/rooms');
  }
  
  res.redirect('/confirmation/' + booking._id);
});

// Confirmation Page
router.get('/confirmation/:id', function(req, res) {
  let booking = Booking.getBookingById(req.params.id);
  if (!booking) {
    return res.redirect('/rooms');
  }
  
  let room = Room.getRoomById(booking.room);
  let bookingWithRoom = {
    _id: booking._id,
    guestName: booking.guestName,
    email: booking.email,
    phone: booking.phone,
    room: room,
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
router.get('/bookings', function(req, res) {
  let bookings = Booking.getAllBookings();
  let bookingsWithRooms = [];
  
  for (let i = 0; i < bookings.length; i++) {
    let room = Room.getRoomById(bookings[i].room);
    let bookingData = {
      _id: bookings[i]._id,
      guestName: bookings[i].guestName,
      email: bookings[i].email,
      phone: bookings[i].phone,
      room: room,
      checkIn: bookings[i].checkIn,
      checkOut: bookings[i].checkOut,
      guests: bookings[i].guests,
      months: bookings[i].months,
      monthlyRate: bookings[i].monthlyRate,
      totalPrice: bookings[i].totalPrice,
      utilities: bookings[i].utilities,
      status: bookings[i].status,
      createdAt: bookings[i].createdAt
    };
    bookingsWithRooms.push(bookingData);
  }
  
  res.render('bookings', { title: 'My Bookings', bookings: bookingsWithRooms });
});

module.exports = router;
