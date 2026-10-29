const mongoose = require('mongoose');
const path = require('path');

const Place = require('../models/Place');
const dataset = require('../data/tamilNaduVerifiedDataset');

async function syncPhotos() {
  const mongoUri = 'mongodb://127.0.0.1:27017/accessable_db';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected to local MongoDB. Syncing authentic photos...');

  let updatedCount = 0;
  for (const item of dataset) {
    const res = await Place.updateOne(
      {
        $or: [
          { providerPlaceId: item.providerPlaceId },
          { name: item.name, district: item.district }
        ]
      },
      {
        $set: {
          photos: item.photos || [],
          images: (item.photos && item.photos.length > 0) ? [item.photos[0].url] : []
        }
      }
    );
    if (res.modifiedCount > 0) updatedCount++;
  }

  // Also clean any leftover places that have unsplash in their photos
  const remainingWithUnsplash = await Place.updateMany(
    { 'photos.url': { $regex: 'unsplash\\.com' } },
    { $set: { photos: [], images: [] } }
  );

  console.log(`Updated ${updatedCount} places with authentic dataset photos.`);
  console.log(`Cleaned ${remainingWithUnsplash.modifiedCount} leftover unsplash records.`);
  await mongoose.disconnect();
}

syncPhotos().catch(console.error);
