const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const upload = require('../middleware/upload');

// Home Page
// Loads available rooms and renders the landing page with featured listings.
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.getAvailableRooms();
    const featuredRooms = rooms.slice(0, 3);
    res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms: featuredRooms });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.render('index', { title: 'StayEase - Find Your Perfect Stay', rooms: [] });
  }
});

// All Rooms Page
// Displays the room catalog, optionally filtering by type, price, and search text.
router.get('/rooms', async (req, res) => {
  try {
    const { type = '', search: searchQuery = '' } = req.query;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice, 10) : NaN;
    const search = searchQuery.toLowerCase().trim();
    
    const rooms = await Room.getAvailableRooms();
    
    const filteredRooms = rooms.filter(room => {
      const typeMatch = !type || room.type === type;
      const priceMatch = isNaN(maxPrice) || room.monthlyPrice <= maxPrice;
      const searchMatch = !search || room.name.toLowerCase().includes(search) || room.description.toLowerCase().includes(search);
      return typeMatch && priceMatch && searchMatch;
    });

    res.render('rooms', { title: 'Browse Rooms', rooms: filteredRooms, query: req.query });
  } catch (error) {
    console.error('Error loading rooms page:', error);
    res.render('rooms', { title: 'Browse Rooms', rooms: [], query: req.query });
  }
});

// Room Detail Page
// Shows the full room detail page for a single room.
router.get('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.getRoomById(req.params.id);
    if (!room) {
      return res.redirect('/rooms');
    }
    res.render('roomDetail', { title: room.name, room });
  } catch (error) {
    console.error('Error loading room detail:', error);
    res.redirect('/rooms');
  }
});

// Booking Form Page
// Displays the booking form for a selected room.
router.get('/book/:id', async (req, res) => {
  try {
    const room = await Room.getRoomById(req.params.id);
    if (!room) {
      return res.redirect('/rooms');
    }
    res.render('bookingForm', { title: 'Book Room', room });
  } catch (error) {
    console.error('Error loading booking form:', error);
    res.redirect('/rooms');
  }
});

// Submit Booking with Aadhar Upload
// Processes the booking form and creates a new booking record with file upload.
router.post('/book/:id', upload.single('aadharPdf'), async (req, res) => {
  try {
    const { guestName, email, phone, aadharNumber, checkIn, checkOut, guests } = req.body;
    
    console.log('Booking request received:', { guestName, email, phone, aadharNumber, roomId: req.params.id });
    
    // Validate Aadhar number
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      console.error('Invalid Aadhar number:', aadharNumber);
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }
      const room = await Room.getRoomById(req.params.id);
      return res.status(400).render('bookingForm', {
        title: 'Book Room',
        room: room,
        error: 'Aadhar number must be exactly 12 digits'
      });
    }

    const aadharPdf = req.file ? `/uploads/aadhar/${req.file.filename}` : null;
    
    console.log('Creating booking with:', { guestName, aadharNumber, roomId: req.params.id, aadharPdf });
    
    const booking = await Booking.createBooking(
      guestName, 
      email, 
      phone, 
      aadharNumber,
      req.params.id, 
      checkIn, 
      checkOut, 
      guests, 
      aadharPdf
    );
    
    if (!booking) {
      console.error('Booking creation failed - booking is null');
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }
      const room = await Room.getRoomById(req.params.id);
      return res.status(400).render('bookingForm', {
        title: 'Book Room',
        room: room,
        error: 'Failed to create booking. Please verify room details and try again.'
      });
    }
    
    console.log('Booking created successfully:', booking._id);
    res.redirect(`/confirmation/${booking._id}`);
  } catch (error) {
    console.error('Error creating booking:', error);
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }
    try {
      const room = await Room.getRoomById(req.params.id);
      return res.status(500).render('bookingForm', {
        title: 'Book Room',
        room: room,
        error: 'An error occurred while creating your booking. Please try again.'
      });
    } catch (e) {
      return res.redirect('/rooms');
    }
  }
});

// Confirmation Page
// Shows a confirmation message and booking details after a successful reservation.
router.get('/confirmation/:id', async (req, res) => {
  try {
    const booking = await Booking.getBookingById(req.params.id);
    if (!booking) {
      return res.redirect('/rooms');
    }
    
    res.render('confirmation', { title: 'Booking Confirmed!', booking });
  } catch (error) {
    console.error('Error loading confirmation:', error);
    res.redirect('/rooms');
  }
});

// View Aadhar PDF
// Serves the uploaded Aadhar PDF for viewing/downloading.
router.get('/view-aadhar/:id', async (req, res) => {
  try {
    const booking = await Booking.getBookingById(req.params.id);
    if (!booking || !booking.aadharPdf) {
      return res.status(404).send('Aadhar document not found');
    }
    
    const filePath = require('path').join(__dirname, '../public', booking.aadharPdf);
    res.download(filePath, `aadhar-${booking.aadharNumber}.pdf`);
  } catch (error) {
    console.error('Error downloading aadhar:', error);
    res.status(500).send('Error downloading document');
  }
});

// My Bookings Page
// Displays all bookings with room details.
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.getAllBookings();
    res.render('bookings', { title: 'My Bookings', bookings });
  } catch (error) {
    console.error('Error loading bookings:', error);
    res.render('bookings', { title: 'My Bookings', bookings: [] });
  }
});

module.exports = router;
