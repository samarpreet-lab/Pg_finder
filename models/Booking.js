const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/data.json');

function loadData() {
  let data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function getAllBookings() {
  let data = loadData();
  return data.bookings;
}

function getBookingById(id) {
  let data = loadData();
  for (let i = 0; i < data.bookings.length; i++) {
    if (data.bookings[i]._id === id) {
      return data.bookings[i];
    }
  }
  return null;
}

function createBooking(guestName, email, phone, roomId, checkIn, checkOut, guests, months) {
  let data = loadData();
  let room = null;
  
  for (let i = 0; i < data.rooms.length; i++) {
    if (data.rooms[i]._id === roomId) {
      room = data.rooms[i];
      break;
    }
  }
  
  if (!room) {
    return null;
  }

  let monthCount = parseInt(months) || 1;
  let totalPrice = monthCount * room.monthlyPrice;

  let newBooking = {
    _id: 'book' + Date.now(),
    guestName: guestName,
    email: email,
    phone: phone,
    room: roomId,
    checkIn: checkIn,
    checkOut: checkOut,
    guests: parseInt(guests),
    months: monthCount,
    monthlyRate: room.monthlyPrice,
    totalPrice: totalPrice,
    utilities: room.utilities,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  data.bookings.push(newBooking);
  saveData(data);
  return newBooking;
}

function updateBookingStatus(id, status) {
  let data = loadData();
  
  for (let i = 0; i < data.bookings.length; i++) {
    if (data.bookings[i]._id === id) {
      data.bookings[i].status = status;
      saveData(data);
      return data.bookings[i];
    }
  }
  return null;
}

function deleteBooking(id) {
  let data = loadData();
  let newBookings = [];
  
  for (let i = 0; i < data.bookings.length; i++) {
    if (data.bookings[i]._id !== id) {
      newBookings.push(data.bookings[i]);
    }
  }
  
  data.bookings = newBookings;
  saveData(data);
  return true;
}

function getRecentBookings(limit) {
  let data = loadData();
  let bookings = data.bookings;
  
  // Sort by createdAt descending
  for (let i = 0; i < bookings.length - 1; i++) {
    for (let j = i + 1; j < bookings.length; j++) {
      let dateA = new Date(bookings[i].createdAt);
      let dateB = new Date(bookings[j].createdAt);
      if (dateB > dateA) {
        let temp = bookings[i];
        bookings[i] = bookings[j];
        bookings[j] = temp;
      }
    }
  }
  
  let result = [];
  let count = limit || 5;
  for (let i = 0; i < bookings.length && i < count; i++) {
    result.push(bookings[i]);
  }
  return result;
}

function getBookingsByStatus(status) {
  let data = loadData();
  let result = [];
  
  for (let i = 0; i < data.bookings.length; i++) {
    if (data.bookings[i].status === status) {
      result.push(data.bookings[i]);
    }
  }
  return result;
}

function calculateRevenue() {
  let data = loadData();
  let total = 0;
  
  for (let i = 0; i < data.bookings.length; i++) {
    if (data.bookings[i].status === 'Confirmed') {
      total = total + data.bookings[i].totalPrice;
    }
  }
  return total;
}

module.exports = {
  getAllBookings: getAllBookings,
  getBookingById: getBookingById,
  createBooking: createBooking,
  updateBookingStatus: updateBookingStatus,
  deleteBooking: deleteBooking,
  getRecentBookings: getRecentBookings,
  getBookingsByStatus: getBookingsByStatus,
  calculateRevenue: calculateRevenue,
  loadData: loadData,
  saveData: saveData
};
