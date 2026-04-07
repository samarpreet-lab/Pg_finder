const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// This router handles all admin-side pages and actions.
// It uses the Room and Booking model helpers to manage data,
// then renders admin-specific views with the required information.

// Admin Dashboard
// Loads summary numbers and recent booking entries so the admin can see platform status.
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

// All Rooms
// Displays the room inventory page where the admin can view all rooms.
router.get('/rooms', (req, res) => {
  const rooms = Room.getAllRooms();
  res.render('admin/rooms', { 
    title: 'Manage Rooms', 
    rooms, 
    footerClass: 'admin-footer', 
    isAdmin: true 
  });
});

// Add Room Form
// Shows an empty form page to create a new room entry.
router.get('/rooms/new', (req, res) => {
  res.render('admin/addRoom', { 
    title: 'Add New Room', 
    room: null, 
    footerClass: 'admin-footer', 
    isAdmin: true 
  });
});

// Save New Room
// Processes the new room form submission and saves the room data.
router.post('/rooms', (req, res) => {
  const {
    name, 
    type, 
    monthlyPrice, 
    description, 
    image = 'https://via.placeholder.com/400x250?text=Room+Image',
    rating = 4.0,
    electricityStatus = 'separate',
    waterStatus = 'included'
  } = req.body;
  
  let amenities = req.body.amenities;
  if (!amenities) {
    amenities = ['WiFi'];
  } else if (!Array.isArray(amenities)) {
    amenities = [amenities];
  }
  
  const utilities = {
    electricity: electricityStatus,
    water: waterStatus,
    description: `Electricity ${electricityStatus}, Water ${waterStatus}`
  };
  
  Room.addRoom(name, type, monthlyPrice, description, image, amenities, utilities, rating);
  res.redirect('/admin/rooms');
});

// Edit Room Form
// Loads an existing room and renders the same add/edit form with values filled in.
router.get('/rooms/:id/edit', (req, res) => {
  const room = Room.getRoomById(req.params.id);
  res.render('admin/addRoom', { 
    title: 'Edit Room', 
    room, 
    footerClass: 'admin-footer', 
    isAdmin: true 
  });
});

// Update Room
// Handles the edit form submission and updates the selected room details.
router.post('/rooms/:id/update', (req, res) => {
  const {
    name,
    type,
    monthlyPrice,
    description,
    image,
    rating,
    electricityStatus = 'separate',
    waterStatus = 'included'
  } = req.body;
  
  const isAvailable = req.body.isAvailable === 'on';
  
  let amenities = req.body.amenities;
  if (!amenities) {
    amenities = ['WiFi'];
  } else if (!Array.isArray(amenities)) {
    amenities = [amenities];
  }
  
  const utilities = {
    electricity: electricityStatus,
    water: waterStatus,
    description: `Electricity ${electricityStatus}, Water ${waterStatus}`
  };
  
  Room.updateRoom(req.params.id, name, type, monthlyPrice, description, image, amenities, isAvailable, utilities, rating);
  res.redirect('/admin/rooms');
});

// Delete Room
// Receives a delete request and removes the room from the data store.
router.post('/rooms/:id/delete', (req, res) => {
  Room.deleteRoom(req.params.id);
  res.redirect('/admin/rooms');
});

// All Bookings
// Shows all bookings with room details so the admin can review reservations.
router.get('/bookings', (req, res) => {
  const data = Booking.loadData();
  const recentBookings = Booking.getRecentBookings(100);
  
  const bookingsWithRooms = recentBookings.map(booking => ({
    _id: booking._id,
    guestName: booking.guestName,
    email: booking.email,
    phone: booking.phone,
    room: data.rooms.find(r => r._id === booking.room),
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
  
  res.render('admin/bookings', { 
    title: 'Manage Bookings', 
    bookings: bookingsWithRooms, 
    footerClass: 'admin-footer', 
    isAdmin: true 
  });
});

// Update Booking Status
// Updates the status of a selected booking (Pending, Confirmed, Cancelled).
router.post('/bookings/:id/update', (req, res) => {
  const { status } = req.body;
  Booking.updateBookingStatus(req.params.id, status);
  res.redirect('/admin/bookings');
});

module.exports = router;
