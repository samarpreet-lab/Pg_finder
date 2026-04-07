const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/data.json');

const loadRooms = () => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

const saveRooms = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

const getAllRooms = () => {
  const data = loadRooms();
  return data.rooms;
};

const getRoomById = (id) => {
  const data = loadRooms();
  return data.rooms.find(room => room._id === id) || null;
};

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

const deleteRoom = (id) => {
  const data = loadRooms();
  data.rooms = data.rooms.filter(room => room._id !== id);
  saveRooms(data);
  return true;
};

const getAvailableRooms = () => {
  const data = loadRooms();
  return data.rooms.filter(room => room.isAvailable);
};

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
