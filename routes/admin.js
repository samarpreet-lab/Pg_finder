const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// ====== ADMIN DASHBOARD ======
// Show the dashboard with room count, booking count, revenue total, and recent bookings.
router.get('/', async (req, res) => {
  try {
    // Step 1: Get counts from database
    const rooms = await Room.find();
    const bookings = await Booking.find();

    // Step 2: Get last 5 bookings with room details
    const recentBookings = await Booking.find()
      .populate('room')
      .sort({ createdAt: -1 })
      .limit(5);

    // Step 3: Calculate total revenue from confirmed bookings
    const revenue = await Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Step 4: Render dashboard with all stats
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      totalRooms: rooms.length,
      totalBookings: bookings.length,
      revenue: revenue.length > 0 ? revenue[0].total : 0,
      recentBookings,
      footerClass: 'admin-footer',
      isAdmin: true
    });
  } catch (error) {
    console.error('Dashboard error:', error);
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

// ====== ALL ROOMS PAGE ======
// Display list of all rooms in the inventory.
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.render('admin/rooms', {
      title: 'Manage Rooms',
      rooms,
      footerClass: 'admin-footer',
      isAdmin: true
    });
  } catch (error) {
    console.error('Rooms list error:', error);
    res.render('admin/rooms', {
      title: 'Manage Rooms',
      rooms: [],
      footerClass: 'admin-footer',
      isAdmin: true
    });
  }
});

// ====== ADD ROOM FORM PAGE ======
// Show the form to add a new room.
router.get('/rooms/new', (req, res) => {
  res.render('admin/addRoom', {
    title: 'Add New Room',
    room: null,
    footerClass: 'admin-footer',
    isAdmin: true
  });
});

// ====== SAVE NEW ROOM ======
// Process the new room form and save to database.
router.post('/rooms', async (req, res) => {
  try {
    const { name, type, monthlyPrice, description, image, amenities, electricityStatus, waterStatus, isAvailable, rating } = req.body;

    // Step 1: Format amenities (handle single or multiple)
    const amenitiesList = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : ['WiFi']);

    // Step 2: Create room object
    const roomData = {
      name,
      type,
      monthlyPrice: parseInt(monthlyPrice),
      description,
      image: image || 'https://via.placeholder.com/400x250?text=Room+Image',
      amenities: amenitiesList,
      utilities: {
        electricity: electricityStatus || 'separate',
        water: waterStatus || 'included',
        description: `Electricity ${electricityStatus || 'separate'}, Water ${waterStatus || 'included'}`
      },
      isAvailable: isAvailable === 'on' || isAvailable === true,
      rating: parseFloat(rating) || 4.0
    };

    // Step 3: Save to database
    await Room.create(roomData);

    // Step 4: Redirect to rooms list
    res.redirect('/admin/rooms');
  } catch (error) {
    console.error('Add room error:', error);
    res.status(400).render('admin/addRoom', {
      title: 'Add New Room',
      room: null,
      error: error.message || 'Error adding room',
      footerClass: 'admin-footer',
      isAdmin: true
    });
  }
});

// ====== EDIT ROOM FORM PAGE ======
// Load a room and show the form to edit it.
router.get('/rooms/:id/edit', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    res.render('admin/addRoom', {
      title: 'Edit Room',
      room,
      footerClass: 'admin-footer',
      isAdmin: true
    });
  } catch (error) {
    console.error('Edit room error:', error);
    res.redirect('/admin/rooms');
  }
});

// ====== UPDATE ROOM ======
// Process the edit room form and update the database.
router.post('/rooms/:id/update', async (req, res) => {
  try {
    const { name, type, monthlyPrice, description, image, amenities, electricityStatus, waterStatus, isAvailable, rating } = req.body;

    // Step 1: Format amenities
    const amenitiesList = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : ['WiFi']);

    // Step 2: Create room object with updates
    const roomData = {
      name,
      type,
      monthlyPrice: parseInt(monthlyPrice),
      description,
      image: image || 'https://via.placeholder.com/400x250?text=Room+Image',
      amenities: amenitiesList,
      utilities: {
        electricity: electricityStatus || 'separate',
        water: waterStatus || 'included',
        description: `Electricity ${electricityStatus || 'separate'}, Water ${waterStatus || 'included'}`
      },
      isAvailable: isAvailable === 'on' || isAvailable === true,
      rating: parseFloat(rating) || 4.0
    };

    // Step 3: Update in database
    await Room.findByIdAndUpdate(req.params.id, roomData, { new: true, runValidators: true });

    // Step 4: Redirect to rooms list
    res.redirect('/admin/rooms');
  } catch (error) {
    console.error('Update room error:', error);
    const room = await Room.findById(req.params.id);
    res.status(400).render('admin/addRoom', {
      title: 'Edit Room',
      room,
      error: error.message || 'Error updating room',
      footerClass: 'admin-footer',
      isAdmin: true
    });
  }
});

// ====== DELETE ROOM ======
// Remove a room from the database.
router.post('/rooms/:id/delete', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.redirect('/admin/rooms');
  } catch (error) {
    console.error('Delete room error:', error);
    res.redirect('/admin/rooms');
  }
});

// ====== ALL BOOKINGS PAGE ======
// Display list of all bookings with room details.
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room')
      .sort({ createdAt: -1 })
      .limit(100);
    res.render('admin/bookings', {
      title: 'Manage Bookings',
      bookings,
      footerClass: 'admin-footer',
      isAdmin: true
    });
  } catch (error) {
    console.error('Bookings list error:', error);
    res.render('admin/bookings', {
      title: 'Manage Bookings',
      bookings: [],
      footerClass: 'admin-footer',
      isAdmin: true
    });
  }
});

// ====== BOOKING DETAILS PAGE ======
// Show full details of a booking including Aadhar information.
router.get('/bookings/:id/details', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.redirect('/admin/bookings');
    res.render('admin/bookingDetails', {
      title: 'Booking Details',
      booking,
      footerClass: 'admin-footer',
      isAdmin: true
    });
  } catch (error) {
    console.error('Booking details error:', error);
    res.redirect('/admin/bookings');
  }
});

// ====== DOWNLOAD AADHAR PDF ======
// Allow admin to download the Aadhar PDF for a booking.
router.get('/bookings/:id/aadhar/download', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || !booking.aadharPdf) {
      return res.status(404).send('Aadhar document not found');
    }

    const filePath = require('path').join(__dirname, '../public', booking.aadharPdf);
    res.download(filePath, `Aadhar_${booking.guestName}_${booking._id}.pdf`);
  } catch (error) {
    console.error('Download aadhar error:', error);
    res.status(500).send('Error downloading Aadhar document');
  }
});

// ====== UPDATE BOOKING STATUS ======
// Change the status of a booking (Pending, Confirmed, Cancelled).
router.post('/bookings/:id/update', async (req, res) => {
  try {
    const { status } = req.body;
    await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.redirect('/admin/bookings');
  } catch (error) {
    console.error('Update booking error:', error);
    res.redirect('/admin/bookings');
  }
});

module.exports = router;
