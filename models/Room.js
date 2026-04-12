const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Suite', 'Shared']
  },
  monthlyPrice: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x250?text=Room+Image'
  },
  amenities: [{
    type: String
  }],
  utilities: {
    electricity: String,
    water: String,
    description: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Room = mongoose.model('Room', roomSchema);

const getAllRooms = async () => {
  return await Room.find();
};

const getRoomById = async (id) => {
  return await Room.findById(id);
};

const addRoom = async (name, type, monthlyPrice, description, image = 'https://via.placeholder.com/400x250?text=Room+Image', amenities = ['WiFi'], utilities = { electricity: 'separate', water: 'included', description: 'Check details' }, rating = 4.0) => {
  try {
    const newRoom = new Room({
      name,
      type,
      monthlyPrice: parseInt(monthlyPrice),
      description,
      image,
      amenities: Array.isArray(amenities) ? amenities : [amenities],
      utilities,
      isAvailable: true,
      rating: parseFloat(rating) || 4.0
    });
    return await newRoom.save();
  } catch (error) {
    console.error('Error adding room:', error);
    return null;
  }
};

const updateRoom = async (id, name, type, monthlyPrice, description, image, amenities, isAvailable, utilities = { electricity: 'separate', water: 'included', description: 'Check details' }, rating) => {
  try {
    const room = await Room.findByIdAndUpdate(
      id,
      {
        name,
        type,
        monthlyPrice: parseInt(monthlyPrice),
        description,
        image,
        amenities: Array.isArray(amenities) ? amenities : [amenities],
        utilities,
        isAvailable,
        rating: parseFloat(rating)
      },
      { new: true }
    );
    return room;
  } catch (error) {
    console.error('Error updating room:', error);
    return null;
  }
};

const deleteRoom = async (id) => {
  try {
    await Room.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error('Error deleting room:', error);
    return false;
  }
};

const getAvailableRooms = async () => {
  return await Room.find({ isAvailable: true });
};

const getRoomsByType = async (type) => {
  return await Room.find({ type, isAvailable: true });
};

module.exports = {
  getAllRooms,
  getRoomById,
  addRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  getRoomsByType,
  Room
};
