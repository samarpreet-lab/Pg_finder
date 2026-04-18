const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email already registered'],
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
    validate: [
      { validator: v => /^\d{10}$/.test(v), msg: 'Phone must be 10 digits' }
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  address: String,
  city: String,
  state: String,
  pincode: String,
  userType: {
    type: String,
    enum: ['student', 'professional', 'other'],
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
