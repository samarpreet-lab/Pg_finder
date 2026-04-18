const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Single', 'Double', 'Suite', 'Shared']
  },
  monthlyPrice: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x250?text=Room+Image'
  },
  amenities: [String],
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
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5'],
    default: 4.0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', roomSchema);
