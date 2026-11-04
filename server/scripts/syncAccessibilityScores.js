const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const Place = require('../models/Place');

async function syncScores() {
  await connectDB();
  console.log('Connected to DB for score sync...');

  // Allow connection to establish
  await new Promise((res) => setTimeout(res, 1000));

  const places = await Place.find({});
  console.log(`Found ${places.length} places. Updating accessibility scores...`);

  let updated = 0;
  for (const place of places) {
    await place.save();
    updated++;
  }

  console.log(`Successfully synced accessibility scores for ${updated} places!`);
  await mongoose.connection.close();
  process.exit(0);
}

syncScores().catch((err) => {
  console.error('Error syncing scores:', err);
  process.exit(1);
});
