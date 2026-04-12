const mongoose = require('mongoose');
require('dotenv').config();

const Room = require('../models/Room');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayease');
    const rooms = await Room.getAllRooms();
    
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         ✓ ROOMS SUCCESSFULLY MIGRATED TO MONGODB            ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    console.log(`Total Rooms in MongoDB: ${rooms.length}\n`);
    
    rooms.forEach((room, idx) => {
      console.log(`${idx + 1}. ${room.name}`);
      console.log(`   ID: ${room._id}`);
      console.log(`   Type: ${room.type} | Price: ₹${room.monthlyPrice}/month`);
      console.log(`   Rating: ${room.rating}⭐ | Available: ${room.isAvailable ? '✓' : '✗'}`);
      console.log(`   Amenities: ${room.amenities.join(', ')}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verify();
