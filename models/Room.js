const fs = require('fs');
const path = require('path');

// Path to the central JSON file that stores room and booking data.
const dataPath = path.join(__dirname, '../data/data.json');

// Read the data file and return parsed JSON.
const loadRooms = () => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

// Save the updated JSON data back to disk.
const saveRooms = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Return the full list of rooms from storage.
const getAllRooms = () => {
  const data = loadRooms();
  return data.rooms;
};

// Find a single room by its unique ID.
const getRoomById = (id) => {
  const data = loadRooms();
  return data.rooms.find(room => room._id === id) || null;
};

// Add a new room entry using the provided values.
const addRoom = (name, type, monthlyPrice, description, image = 'https://via.placeholder.com/400x250?text=Room+Image', amenities = ['WiFi'], utilities = { electricity: 'separate', water: 'included', description: 'Check details' }, rating = 4.0) => {
  const data = loadRooms();
  
  const newRoom = {
    _id: `room${Date.now()}`,
    name,
    type,
    monthlyPrice: parseInt(monthlyPrice),
    description,
    image,
    amenities: Array.isArray(amenities) ? amenities : [amenities],
    isAvailable: true,
    utilities,
    rating: parseFloat(rating) || 4.0
  };
  
  data.rooms.push(newRoom);
  saveRooms(data);
  return newRoom;
};

// Update the details of an existing room by ID.
const updateRoom = (id, name, type, monthlyPrice, description, image, amenities, isAvailable, utilities = { electricity: 'separate', water: 'included', description: 'Check details' }, rating) => {
  const data = loadRooms();
  const roomIndex = data.rooms.findIndex(room => room._id === id);
  
  if (roomIndex > -1) {
    data.rooms[roomIndex] = {
      ...data.rooms[roomIndex],
      name,
      type,
      monthlyPrice: parseInt(monthlyPrice),
      description,
      image,
      amenities: Array.isArray(amenities) ? amenities : [amenities],
      isAvailable,
      utilities,
      rating: parseFloat(rating)
    };
    saveRooms(data);
    return data.rooms[roomIndex];
  }
  return null;
};

// Remove a room from the data store by its ID.
const deleteRoom = (id) => {
  const data = loadRooms();
  data.rooms = data.rooms.filter(room => room._id !== id);
  saveRooms(data);
  return true;
};

// Return only rooms that are currently available for booking.
const getAvailableRooms = () => {
  const data = loadRooms();
  return data.rooms.filter(room => room.isAvailable);
};

// Return available rooms filtered by the selected room type.
const getRoomsByType = (type) => {
  const data = loadRooms();
  return data.rooms.filter(room => room.type === type && room.isAvailable);
};

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
