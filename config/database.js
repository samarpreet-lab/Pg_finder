const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stayease';

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    console.log('Please ensure MongoDB is running locally on port 27017');
    // Don't exit, just log the error - app can still run without DB for now
    return false;
  }
};

module.exports = connectDB;
