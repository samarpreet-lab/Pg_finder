const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Room = require('../models/Room');
const Booking = require('../models/Booking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stayease';

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read JSON data
    const dataPath = path.join(__dirname, '../data/data.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Clear existing collections
    await Room.Room.deleteMany({});
    await Booking.Booking.deleteMany({});
    console.log('Cleared existing collections');

    // Migrate rooms
    console.log(`Migrating ${jsonData.rooms.length} rooms...`);
    for (const room of jsonData.rooms) {
      await Room.addRoom(
        room.name,
        room.type,
        room.monthlyPrice,
        room.description,
        room.image,
        room.amenities,
        room.utilities,
        room.rating
      );
    }
    console.log('✓ Rooms migrated');

    // Get migrated rooms for reference
    const migratedRooms = await Room.getAllRooms();
    const roomIdMap = {};
    
    jsonData.rooms.forEach((oldRoom, index) => {
      if (migratedRooms[index]) {
        roomIdMap[oldRoom._id] = migratedRooms[index]._id;
      }
    });

    // Migrate bookings
    console.log(`Migrating ${jsonData.bookings.length} bookings...`);
    for (const booking of jsonData.bookings) {
      const newRoomId = roomIdMap[booking.room];
      if (newRoomId) {
        await Booking.createBooking(
          booking.guestName,
          booking.email,
          booking.phone,
          booking.aadharNumber || '000000000000',
          newRoomId,
          booking.checkIn,
          booking.checkOut,
          booking.guests,
          booking.aadharPdf || null
        );
      }
    }
    console.log('✓ Bookings migrated');

    // Verify migration
    const totalRooms = await Room.getAllRooms();
    const totalBookings = await Booking.getAllBookings();

    console.log('\n=== Migration Summary ===');
    console.log(`Rooms: ${totalRooms.length} migrated`);
    console.log(`Bookings: ${totalBookings.length} migrated`);
    console.log('Migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
