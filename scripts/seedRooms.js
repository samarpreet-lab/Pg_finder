const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Room = require('../models/Room');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stayease';

async function seedRooms() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Read JSON data
    const dataPath = path.join(__dirname, '../data/data.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log(`\n📊 Starting to add ${jsonData.rooms.length} rooms to MongoDB...`);

    // Add each room
    let addedCount = 0;
    for (const room of jsonData.rooms) {
      try {
        const result = await Room.addRoom(
          room.name,
          room.type === 'Deluxe' ? 'Suite' : room.type, // Map Deluxe to Suite for MongoDB enum
          room.monthlyPrice,
          room.description,
          room.image,
          room.amenities || ['WiFi'],
          room.utilities,
          room.rating
        );
        if (result) {
          addedCount++;
          console.log(`✓ Added: ${room.name} (₹${room.monthlyPrice}/month)`);
        }
      } catch (error) {
        console.error(`✗ Error adding ${room.name}:`, error.message);
      }
    }

    // Verify
    const allRooms = await Room.getAllRooms();
    console.log(`\n═══════════════════════════════════════════════════`);
    console.log(`✓ Successfully added ${addedCount} rooms`);
    console.log(`✓ Total rooms in MongoDB: ${allRooms.length}`);
    console.log(`═══════════════════════════════════════════════════\n`);

    // Display room summary
    console.log('Room Summary:');
    allRooms.forEach((room, index) => {
      console.log(`${index + 1}. ${room.name}`);
      console.log(`   Type: ${room.type} | Price: ₹${room.monthlyPrice}/month | Rating: ${room.rating}⭐`);
      console.log(`   Available: ${room.isAvailable ? 'Yes' : 'No'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedRooms();
