const fs = require('fs');
const path = require('path');

// Load rooms data from JSON file
function loadRooms() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/data.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { rooms: [], bookings: [] };
  }
}

// Save rooms data to JSON file
function saveRooms(data) {
  fs.writeFileSync(path.join(__dirname, '../data/data.json'), JSON.stringify(data, null, 2));
}

// Get all rooms
function getAllRooms() {
  const data = loadRooms();
  return data.rooms;
}

// Get room by ID
function getRoomById(id) {
  const data = loadRooms();
  return data.rooms.find(room => room._id === id);
}

// Add new room
function addRoom(name, type, monthlyPrice, description, image = 'https://via.placeholder.com/400x250?text=Room+Image', amenities = ['WiFi'], utilities = { electricity: 'separate', water: 'included', description: 'Check details' }, rating = 4.0) {
  const data = loadRooms();
  const newRoom = {
    _id: 'room' + Date.now(),
    name,
    type,
    monthlyPrice: parseInt(monthlyPrice),
    description,
    image,
    amenities: Array.isArray(amenities) ? amenities : [amenities],
    isAvailable: true,
    utilities: utilities || { electricity: 'separate', water: 'included', description: 'Check details' },
    rating: parseFloat(rating)
  };
  data.rooms.push(newRoom);
  saveRooms(data);
  return newRoom;
}

// Update room
function updateRoom(id, name, type, monthlyPrice, description, image, amenities, isAvailable, utilities, rating) {
  const data = loadRooms();
  const roomIndex = data.rooms.findIndex(room => room._id === id);
  if (roomIndex !== -1) {
    data.rooms[roomIndex] = {
      ...data.rooms[roomIndex],
      name,
      type,
      monthlyPrice: parseInt(monthlyPrice),
      description,
      image,
      amenities: Array.isArray(amenities) ? amenities : [amenities],
      isAvailable,
      utilities: utilities || { electricity: 'separate', water: 'included', description: 'Check details' },
      rating: parseFloat(rating)
    };
    saveRooms(data);
    return data.rooms[roomIndex];
  }
  return null;
}

// Delete room
function deleteRoom(id) {
  const data = loadRooms();
  const filteredRooms = data.rooms.filter(room => room._id !== id);
  if (filteredRooms.length < data.rooms.length) {
    data.rooms = filteredRooms;
    saveRooms(data);
    return true;
  }
  return false;
}

// Get available rooms
function getAvailableRooms() {
  const data = loadRooms();
  return data.rooms.filter(room => room.isAvailable);
}

// Get rooms by type
function getRoomsByType(type) {
  const data = loadRooms();
  return data.rooms.filter(room => room.type === type && room.isAvailable);
}

module.exports = {
  getAllRooms,
  getRoomById,
  addRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  getRoomsByType,
  loadRooms,
  saveRooms
};
