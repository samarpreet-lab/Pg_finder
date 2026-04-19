const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
    validate: [
      { validator: v => /^\d{10}$/.test(v), msg: 'Phone must be 10 digits' }
    ]
  },
  aadharNumber: {
    type: String,
    required: [true, 'Aadhar number is required'],
    trim: true,
    validate: [
      { validator: v => /^\d{12}$/.test(v), msg: 'Aadhar must be 12 digits' }
    ]
  },
  aadharPdf: String,
  aadharUploadDate: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: Date,
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest required']
  },
  monthlyRate: {
    type: Number,
    required: [true, 'Monthly rate is required']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  utilities: {
    electricity: String,
    water: String,
    description: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
