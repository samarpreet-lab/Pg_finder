const express = require('express');
const router = express.Router();
const [Room, Booking] = [require('../models/Room'), require('../models/Booking')];

const renderAdmin = (res, view, data) => res.render(view, { footerClass: 'admin-footer', isAdmin: true, ...data });

// Helper to format room data from req.body
const getRoomData = (body) => ({
  ...body,
  monthlyPrice: parseInt(body.monthlyPrice),
  amenities: Array.isArray(body.amenities) ? body.amenities : [body.amenities || 'WiFi'],
  utilities: { electricity: body.electricityStatus || 'separate', water: body.waterStatus || 'included', description: `Electricity ${body.electricityStatus || 'separate'}` },
  isAvailable: body.isAvailable === 'on' || body.isAvailable === true,
  rating: parseFloat(body.rating) || 4.0
});

// ====== DASHBOARD ======
router.get('/', async (req, res) => {
  try {
    const [rooms, bookings, recentBookings, revenue] = await Promise.all([
      Room.countDocuments(), Booking.countDocuments(),
      Booking.find().populate('room').sort({ createdAt: -1 }).limit(5),
      Booking.aggregate([{ $match: { status: 'Confirmed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }])
    ]);
    renderAdmin(res, 'admin/dashboard', { title: 'Admin Dashboard', totalRooms: rooms, totalBookings: bookings, revenue: revenue[0]?.total || 0, recentBookings });
  } catch (error) { renderAdmin(res, 'admin/dashboard', { title: 'Admin Dashboard', totalRooms: 0, totalBookings: 0, revenue: 0, recentBookings: [] }); }
});

// ====== ROOMS ======
router.get('/rooms', async (req, res) => renderAdmin(res, 'admin/rooms', { title: 'Manage Rooms', rooms: await Room.find().catch(() => []) }));

router.route('/rooms/new')
  .get((req, res) => renderAdmin(res, 'admin/addRoom', { title: 'Add New Room', room: null }));

router.post('/rooms', async (req, res) => {
  await Room.create(getRoomData(req.body)).catch(() => null);
  res.redirect('/admin/rooms');
});

router.get('/rooms/:id/edit', async (req, res) => {
  const room = await Room.findById(req.params.id).catch(() => null);
  room ? renderAdmin(res, 'admin/addRoom', { title: 'Edit Room', room }) : res.redirect('/admin/rooms');
});

router.post('/rooms/:id/update', async (req, res) => {
  await Room.findByIdAndUpdate(req.params.id, getRoomData(req.body)).catch(() => null);
  res.redirect('/admin/rooms');
});

router.post('/rooms/:id/delete', async (req, res) => {
  await Room.findByIdAndDelete(req.params.id).catch(() => null);
  res.redirect('/admin/rooms');
});

// ====== BOOKINGS ======
router.get('/bookings', async (req, res) => {
  renderAdmin(res, 'admin/bookings', { title: 'Manage Bookings', bookings: await Booking.find().populate('room').sort({ createdAt: -1 }).limit(100).catch(() => []) });
});

router.get('/bookings/:id/details', async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room').catch(() => null);
  booking ? renderAdmin(res, 'admin/bookingDetails', { title: 'Booking Details', booking }) : res.redirect('/admin/bookings');
});

router.post('/bookings/:id/update', async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }).catch(() => null);
  res.redirect('/admin/bookings');
});

router.get('/bookings/:id/aadhar/download', async (req, res) => {
  const booking = await Booking.findById(req.params.id).catch(() => null);
  if (!booking?.aadharPdf) return res.status(404).send('Document not found');
  res.download(require('path').join(__dirname, '../public', booking.aadharPdf), `Aadhar_${booking.guestName}_${booking._id}.pdf`);
});

module.exports = router;
