const fs = require('fs');
const path = require('path');

// Path to the central JSON file that stores room and booking data.
const dataPath = path.join(__dirname, '../data/data.json');

// Read the data file and return parsed JSON.
const loadData = () => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

// Save the updated JSON data back to disk.
const saveData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Return the full list of bookings from storage.
const getAllBookings = () => {
  const data = loadData();
  return data.bookings;
};

// Find a single booking by its unique ID.
const getBookingById = (id) => {
  const data = loadData();
  return data.bookings.find(booking => booking._id === id) || null;
};

// Create a new booking record for a room and save it.
const createBooking = (guestName, email, phone, roomId, checkIn, checkOut, guests, months) => {
  const data = loadData();
  const room = data.rooms.find(r => r._id === roomId);
  
  if (!room) {
    return null;
  }

  const monthCount = parseInt(months) || 1;
  const totalPrice = monthCount * room.monthlyPrice;

  const newBooking = {
    _id: `book${Date.now()}`,
    guestName,
    email,
    phone,
    room: roomId,
    checkIn,
    checkOut,
    guests: parseInt(guests),
    months: monthCount,
    monthlyRate: room.monthlyPrice,
    totalPrice,
    utilities: room.utilities,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  data.bookings.push(newBooking);
  saveData(data);
  return newBooking;
};

// Change the status of an existing booking (for example to Confirmed).
const updateBookingStatus = (id, status) => {
  const data = loadData();
  const bookingIndex = data.bookings.findIndex(booking => booking._id === id);
  
  if (bookingIndex > -1) {
    data.bookings[bookingIndex].status = status;
    saveData(data);
    return data.bookings[bookingIndex];
  }
  return null;
};

// Remove a booking from storage by its ID.
const deleteBooking = (id) => {
  const data = loadData();
  data.bookings = data.bookings.filter(booking => booking._id !== id);
  saveData(data);
  return true;
};

// Return the most recent bookings, sorted newest first.
const getRecentBookings = (limit = 5) => {
  const data = loadData();
  return [...data.bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

// Return bookings filtered by a specific status value.
const getBookingsByStatus = (status) => {
  const data = loadData();
  return data.bookings.filter(booking => booking.status === status);
};

// Calculate total revenue from all confirmed bookings.
const calculateRevenue = () => {
  const data = loadData();
  return data.bookings
    .filter(booking => booking.status === 'Confirmed')
    .reduce((total, booking) => total + booking.totalPrice, 0);
};

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
