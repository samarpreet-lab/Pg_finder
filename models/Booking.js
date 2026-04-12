const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guestName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  aadharNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhar number must be 12 digits'
    }
  },
  aadharPdf: {
    type: String,
    required: false
  },
  aadharUploadDate: {
    type: Date,
    default: null
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: false
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  monthlyRate: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
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

const Booking = mongoose.model('Booking', bookingSchema);

const getAllBookings = async () => {
  return await Booking.find().populate('room');
};

const getBookingById = async (id) => {
  return await Booking.findById(id).populate('room');
};

const createBooking = async (guestName, email, phone, aadharNumber, roomId, checkIn, checkOut, guests, aadharPdf = null) => {
  try {
    const Room = require('./Room');
    const room = await Room.getRoomById(roomId);
    
    if (!room) {
      console.error(`Room not found: ${roomId}`);
      return null;
    }

    const totalPrice = room.monthlyPrice;

    const newBooking = new Booking({
      guestName,
      email,
      phone,
      aadharNumber,
      aadharPdf,
      aadharUploadDate: aadharPdf ? new Date() : null,
      room: roomId,
      checkIn,
      checkOut,
      guests: parseInt(guests),
      monthlyRate: room.monthlyPrice,
      totalPrice,
      utilities: room.utilities,
      status: 'Pending'
    });

    return await newBooking.save();
  } catch (error) {
    console.error('Error creating booking:', error);
    return null;
  }
};

const updateBookingStatus = async (id, status) => {
  try {
    return await Booking.findByIdAndUpdate(id, { status }, { new: true });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return null;
  }
};

const deleteBooking = async (id) => {
  try {
    await Booking.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error('Error deleting booking:', error);
    return false;
  }
};

const getRecentBookings = async (limit = 5) => {
  return await Booking.find()
    .populate('room')
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getBookingsByStatus = async (status) => {
  return await Booking.find({ status }).populate('room');
};

const calculateRevenue = async () => {
  const result = await Booking.aggregate([
    { $match: { status: 'Confirmed' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
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
  Booking
};
