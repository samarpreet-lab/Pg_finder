const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/data.json');

function loadRooms() {
  let data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
}

function saveRooms(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function getAllRooms() {
  let data = loadRooms();
  return data.rooms;
}

function getRoomById(id) {
  let data = loadRooms();
  for (let i = 0; i < data.rooms.length; i++) {
    if (data.rooms[i]._id === id) {
      return data.rooms[i];
    }
  }
  return null;
}

function addRoom(name, type, monthlyPrice, description, image, amenities, utilities, rating) {
  let data = loadRooms();
  
  let newRoom = {
    _id: 'room' + Date.now(),
    name: name,
    type: type,
    monthlyPrice: parseInt(monthlyPrice),
    description: description,
    image: image || 'https://via.placeholder.com/400x250?text=Room+Image',
    amenities: amenities || ['WiFi'],
    isAvailable: true,
    utilities: utilities || { electricity: 'separate', water: 'included', description: 'Check details' },
    rating: parseFloat(rating) || 4.0
  };
  
  data.rooms.push(newRoom);
  saveRooms(data);
  return newRoom;
}

function updateRoom(id, name, type, monthlyPrice, description, image, amenities, isAvailable, utilities, rating) {
  let data = loadRooms();
  
  for (let i = 0; i < data.rooms.length; i++) {
    if (data.rooms[i]._id === id) {
      data.rooms[i].name = name;
      data.rooms[i].type = type;
      data.rooms[i].monthlyPrice = parseInt(monthlyPrice);
      data.rooms[i].description = description;
      data.rooms[i].image = image;
      data.rooms[i].amenities = amenities;
      data.rooms[i].isAvailable = isAvailable;
      data.rooms[i].utilities = utilities || { electricity: 'separate', water: 'included', description: 'Check details' };
      data.rooms[i].rating = parseFloat(rating);
      saveRooms(data);
      return data.rooms[i];
    }
  }
  return null;
}

function deleteRoom(id) {
  let data = loadRooms();
  let newRooms = [];
  
  for (let i = 0; i < data.rooms.length; i++) {
    if (data.rooms[i]._id !== id) {
      newRooms.push(data.rooms[i]);
    }
  }
  
  data.rooms = newRooms;
  saveRooms(data);
  return true;
}

function getAvailableRooms() {
  let data = loadRooms();
  let available = [];
  
  for (let i = 0; i < data.rooms.length; i++) {
    if (data.rooms[i].isAvailable) {
      available.push(data.rooms[i]);
    }
  }
  return available;
}

function getRoomsByType(type) {
  let data = loadRooms();
  let result = [];
  
  for (let i = 0; i < data.rooms.length; i++) {
    if (data.rooms[i].type === type && data.rooms[i].isAvailable) {
      result.push(data.rooms[i]);
    }
  }
  return result;
}

module.exports = {
  getAllRooms: getAllRooms,
  getRoomById: getRoomById,
  addRoom: addRoom,
  updateRoom: updateRoom,
  deleteRoom: deleteRoom,
  getAvailableRooms: getAvailableRooms,
  getRoomsByType: getRoomsByType,
  loadRooms: loadRooms,
  saveRooms: saveRooms
};
