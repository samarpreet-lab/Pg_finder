const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Admin Dashboard
// Loads summary numbers and recent booking entries so the admin can see platform status.
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.getAllRooms();
    const bookings = await Booking.getAllBookings();
    const recentBookings = await Booking.getRecentBookings(5);
    const revenue = await Booking.calculateRevenue();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      totalRooms: rooms.length,
      totalBookings: bookings.length,
      revenue,
      recentBookings,
      footerClass: 'admin-footer',
      isAdmin: true
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      totalRooms: 0,
      totalBookings: 0,
      revenue: 0,
      recentBookings: [],
      footerClass: 'admin-footer',
      isAdmin: true
    });
  }
});

// All Rooms
// Displays the room inventory page where the admin can view all rooms.
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.getAllRooms();
    res.render('admin/rooms', { 
      title: 'Manage Rooms', 
      rooms, 
      footerClass: 'admin-footer', 
      isAdmin: true 
    });
  } catch (error) {
    console.error('Error loading admin rooms:', error);
    res.render('admin/rooms', { 
      title: 'Manage Rooms', 
      rooms: [], 
      footerClass: 'admin-footer', 
      isAdmin: true 
    });
  }
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
router.post('/rooms', async (req, res) => {
  try {
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
    
    await Room.addRoom(name, type, monthlyPrice, description, image, amenities, utilities, rating);
    res.redirect('/admin/rooms');
  } catch (error) {
    console.error('Error adding room:', error);
    res.redirect('/admin/rooms');
  }
});

// Edit Room Form
// Loads an existing room and renders the same add/edit form with values filled in.
router.get('/rooms/:id/edit', async (req, res) => {
  try {
    const room = await Room.getRoomById(req.params.id);
    res.render('admin/addRoom', { 
      title: 'Edit Room', 
      room, 
      footerClass: 'admin-footer', 
      isAdmin: true 
    });
  } catch (error) {
    console.error('Error loading edit room:', error);
    res.redirect('/admin/rooms');
  }
});

// Update Room
// Handles the edit form submission and updates the selected room details.
router.post('/rooms/:id/update', async (req, res) => {
  try {
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
    
    await Room.updateRoom(req.params.id, name, type, monthlyPrice, description, image, amenities, isAvailable, utilities, rating);
    res.redirect('/admin/rooms');
  } catch (error) {
    console.error('Error updating room:', error);
    res.redirect('/admin/rooms');
  }
});

// Delete Room
// Receives a delete request and removes the room from the data store.
router.post('/rooms/:id/delete', async (req, res) => {
  try {
    await Room.deleteRoom(req.params.id);
    res.redirect('/admin/rooms');
  } catch (error) {
    console.error('Error deleting room:', error);
    res.redirect('/admin/rooms');
  }
});

// All Bookings
// Shows all bookings with room details so the admin can review reservations.
router.get('/bookings', async (req, res) => {
  try {
    const recentBookings = await Booking.getRecentBookings(100);
    res.render('admin/bookings', { 
      title: 'Manage Bookings', 
      bookings: recentBookings, 
      footerClass: 'admin-footer', 
      isAdmin: true 
    });
  } catch (error) {
    console.error('Error loading admin bookings:', error);
    res.render('admin/bookings', { 
      title: 'Manage Bookings', 
      bookings: [], 
      footerClass: 'admin-footer', 
      isAdmin: true 
    });
  }
});

// View Booking Details with Aadhar
// Shows complete booking details including Aadhar information for admin review.
router.get('/bookings/:id/details', async (req, res) => {
  try {
    const booking = await Booking.getBookingById(req.params.id);
    if (!booking) {
      return res.redirect('/admin/bookings');
    }
    
    res.render('admin/bookingDetails', { 
      title: 'Booking Details', 
      booking, 
      footerClass: 'admin-footer', 
      isAdmin: true 
    });
  } catch (error) {
    console.error('Error loading booking details:', error);
    res.redirect('/admin/bookings');
  }
});

// Download Aadhar PDF
// Allows admin to download the Aadhar PDF document for a booking.
router.get('/bookings/:id/aadhar/download', async (req, res) => {
  try {
    const booking = await Booking.getBookingById(req.params.id);
    if (!booking || !booking.aadharPdf) {
      return res.status(404).send('Aadhar document not found');
    }
    
    const filePath = require('path').join(__dirname, '../public', booking.aadharPdf);
    res.download(filePath, `Aadhar_${booking.guestName}_${booking._id}.pdf`);
  } catch (error) {
    console.error('Error downloading Aadhar:', error);
    res.status(500).send('Error downloading Aadhar document');
  }
});

// Update Booking Status
// Updates the status of a selected booking (Pending, Confirmed, Cancelled).
router.post('/bookings/:id/update', async (req, res) => {
  try {
    const { status } = req.body;
    await Booking.updateBookingStatus(req.params.id, status);
    res.redirect('/admin/bookings');
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.redirect('/admin/bookings');
  }
});

module.exports = router;
