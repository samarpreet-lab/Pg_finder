const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  fullName: {
    type: String,
    default: 'Admin'
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get admin by username
adminSchema.statics.getAdminByUsername = async function(username) {
  return await this.findOne({ username: username.toLowerCase(), isActive: true });
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
