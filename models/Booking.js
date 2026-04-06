const fs = require('fs');
const path = require('path');

// Load all data from JSON file
function loadData() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/data.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { rooms: [], bookings: [] };
  }
}

// Save data to JSON file
function saveData(data) {
  fs.writeFileSync(path.join(__dirname, '../data/data.json'), JSON.stringify(data, null, 2));
}

// Get all bookings
function getAllBookings() {
  const data = loadData();
  return data.bookings;
}

// Get booking by ID
function getBookingById(id) {
  const data = loadData();
  return data.bookings.find(booking => booking._id === id);
}

// Create new booking
function createBooking(guestName, email, phone, roomId, checkIn, checkOut, guests, months = 1) {
  const data = loadData();
  const room = data.rooms.find(r => r._id === roomId);
  
  if (!room) {
    return null;
  }

  // Calculate total price based on months
  const totalPrice = months * room.monthlyPrice;

  const newBooking = {
    _id: 'book' + Date.now(),
    guestName,
    email,
    phone,
    room: roomId,
    checkIn,
    checkOut,
    guests: parseInt(guests),
    months: parseInt(months),
    monthlyRate: room.monthlyPrice,
    totalPrice,
    utilities: room.utilities,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  data.bookings.push(newBooking);
  saveData(data);
  return newBooking;
}

// Update booking status
function updateBookingStatus(id, status) {
  const data = loadData();
  const bookingIndex = data.bookings.findIndex(b => b._id === id);
  if (bookingIndex !== -1) {
    data.bookings[bookingIndex].status = status;
    saveData(data);
    return data.bookings[bookingIndex];
  }
  return null;
}

// Delete booking
function deleteBooking(id) {
  const data = loadData();
  const filteredBookings = data.bookings.filter(b => b._id !== id);
  if (filteredBookings.length < data.bookings.length) {
    data.bookings = filteredBookings;
    saveData(data);
    return true;
  }
  return false;
}

// Get recent bookings
function getRecentBookings(limit = 5) {
  const data = loadData();
  return data.bookings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

// Get bookings by status
function getBookingsByStatus(status) {
  const data = loadData();
  return data.bookings.filter(b => b.status === status);
}

// Calculate total revenue
function calculateRevenue() {
  const data = loadData();
  return data.bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);
}

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getRecentBookings,
  getBookingsByStatus,
  calculateRevenue,
  loadData,
  saveData
};
