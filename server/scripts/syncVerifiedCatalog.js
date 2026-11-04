const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const catalog = require('./verifiedCommonsCatalog.json');
const datasetPath = path.join(__dirname, '../data/tamilNaduVerifiedDataset.js');
const dataset = require('../data/tamilNaduVerifiedDataset');

async function sync() {
  console.log('=== SYNCING VERIFIED WIKIMEDIA COMMONS CATALOG ===');
  console.log(`Total catalog entries: ${Object.keys(catalog).length}`);

  let updatedCount = 0;
  let clearedCount = 0;

  dataset.forEach((place) => {
    const verified = catalog[place.providerPlaceId];
    if (verified) {
      place.photos = [
        {
          url: verified.url.split('?')[0], // clean URL without tracking params
          caption: verified.caption,
          attribution: verified.attribution.replace(/\n/g, ' '),
          authorName: verified.authorName.replace(/\n/g, ' '),
          license: verified.license,
          wikimediaPage: verified.wikimediaPage,
          isVerified: true
        }
      ];
      updatedCount++;
    } else {
      place.photos = [];
      clearedCount++;
    }
  });

  const output = `/**
 * AccessAble — Real Places Verified Dataset for Tamil Nadu
 * 
 * 90 genuine, identifiable public places across Western, Northern,
 * Central, Southern Tamil Nadu and major tourism destinations.
 * 
 * Strict Photographic Policy:
 * - Genuine Wikimedia Commons / CC-BY-SA photographs for confirmed venues.
 * - Empty photos array for venues awaiting ground photographic audit
 *   (rendered with a neutral, professional "Photo unavailable" placeholder).
 * - Zero random or generic Unsplash stock photos.
 */

const TAMIL_NADU_VERIFIED_PLACES = ${JSON.stringify(dataset, null, 2)};

module.exports = TAMIL_NADU_VERIFIED_PLACES;
`;

  fs.writeFileSync(datasetPath, output, 'utf8');
  console.log(`Updated tamilNaduVerifiedDataset.js: ${updatedCount} with verified photos, ${clearedCount} neutral placeholders.`);

  // Sync to live MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accessable_db';
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  const Place = require('../models/Place');
  let dbUpdated = 0;

  // Clear unverified photos across all places first to ensure zero broken/unverified URLs
  await Place.updateMany({}, { $set: { photos: [] } });

  // Update confirmed venues
  for (const place of dataset) {
    if (place.photos && place.photos.length > 0) {
      const res = await Place.updateOne(
        { providerPlaceId: place.providerPlaceId },
        { $set: { photos: place.photos } }
      );
      if (res.matchedCount > 0) {
        dbUpdated += res.matchedCount;
      }
    }
  }

  const allPlaces = await Place.find({}, 'name photos');
  const withPhotos = allPlaces.filter((p) => p.photos && p.photos.length > 0);
  console.log(`MongoDB sync complete. Places with verified genuine photos: ${withPhotos.length} / ${allPlaces.length}`);

  await mongoose.disconnect();
}

sync().catch(console.error);
