const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Admin Dashboard
router.get('/', function(req, res) {
  let rooms = Room.getAllRooms();
  let bookings = Booking.getAllBookings();
  let recentBookings = Booking.getRecentBookings(5);
  let revenue = Booking.calculateRevenue();

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    totalRooms: rooms.length,
    totalBookings: bookings.length,
    revenue: revenue,
    recentBookings: recentBookings,
    footerClass: 'admin-footer',
    isAdmin: true
  });
});

// All Rooms
router.get('/rooms', function(req, res) {
  let rooms = Room.getAllRooms();
  res.render('admin/rooms', { 
    title: 'Manage Rooms', 
    rooms: rooms, 
    footerClass: 'admin-footer', 
    isAdmin: true 
  });
});

// Add Room Form
router.get('/rooms/new', function(req, res) {
  res.render('admin/addRoom', { 
    title: 'Add New Room', 
    room: null, 
    footerClass: 'admin-footer', 
    isAdmin: true 
  });
});

// Save New Room
router.post('/rooms', function(req, res) {
  let name = req.body.name;
  let type = req.body.type;
  let monthlyPrice = req.body.monthlyPrice;
  let description = req.body.description;
  let image = req.body.image || 'https://via.placeholder.com/400x250?text=Room+Image';
  let amenities = req.body.amenities;
  let rating = req.body.rating || 4.0;
  let electricityStatus = req.body.electricityStatus || 'separate';
  let waterStatus = req.body.waterStatus || 'included';
  
  if (!amenities) {
    amenities = ['WiFi'];
  } else if (!Array.isArray(amenities)) {
    amenities = [amenities];
  }
  
  let utilities = {
    electricity: electricityStatus,
    water: waterStatus,
    description: 'Electricity ' + electricityStatus + ', Water ' + waterStatus
  };
  
  Room.addRoom(name, type, monthlyPrice, description, image, amenities, utilities, rating);
  res.redirect('/admin/rooms');
});

// Edit Room Form
router.get('/rooms/:id/edit', function(req, res) {
  let room = Room.getRoomById(req.params.id);
  res.render('admin/addRoom', { 
    title: 'Edit Room', 
    room: room, 
    footerClass: 'admin-footer', 
    isAdmin: true 
  });
});

// Update Room
router.put('/rooms/:id', function(req, res) {
  let name = req.body.name;
  let type = req.body.type;
  let monthlyPrice = req.body.monthlyPrice;
  let description = req.body.description;
  let image = req.body.image;
  let amenities = req.body.amenities;
  let rating = req.body.rating;
  let isAvailable = req.body.isAvailable === 'on';
  let electricityStatus = req.body.electricityStatus || 'separate';
  let waterStatus = req.body.waterStatus || 'included';
  
  if (!amenities) {
    amenities = ['WiFi'];
  } else if (!Array.isArray(amenities)) {
    amenities = [amenities];
  }
  
  let utilities = {
    electricity: electricityStatus,
    water: waterStatus,
    description: 'Electricity ' + electricityStatus + ', Water ' + waterStatus
  };
  
  Room.updateRoom(req.params.id, name, type, monthlyPrice, description, image, amenities, isAvailable, utilities, rating);
  res.redirect('/admin/rooms');
});

// Delete Room
router.delete('/rooms/:id', function(req, res) {
  Room.deleteRoom(req.params.id);
  res.redirect('/admin/rooms');
});

// All Bookings
router.get('/bookings', function(req, res) {
  let data = Booking.loadData();
  let recentBookings = Booking.getRecentBookings(100);
  let bookingsWithRooms = [];
  
  for (let i = 0; i < recentBookings.length; i++) {
    let booking = recentBookings[i];
    let room = null;
    
    for (let j = 0; j < data.rooms.length; j++) {
      if (data.rooms[j]._id === booking.room) {
        room = data.rooms[j];
        break;
      }
    }
    
    let bookingData = {
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
    bookingsWithRooms.push(bookingData);
  }
  
  res.render('admin/bookings', { 
    title: 'Manage Bookings', 
    bookings: bookingsWithRooms, 
    footerClass: 'admin-footer', 
    isAdmin: true 
  });
});

// Update Booking Status
router.put('/bookings/:id', function(req, res) {
  let status = req.body.status;
  Booking.updateBookingStatus(req.params.id, status);
  res.redirect('/admin/bookings');
});

module.exports = router;
