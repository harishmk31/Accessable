const https = require('https');
const mongoose = require('mongoose');
const path = require('path');

const dataset = require('../data/tamilNaduVerifiedDataset');

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(
        url,
        {
          method: 'HEAD',
          headers: {
            'User-Agent': 'AccessAbleAccessibilityBot/1.0 (College Mini Project; Educational Use)'
          },
          timeout: 8000
        },
        (res) => {
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
        }
      );
      req.on('error', (err) => resolve({ status: 'ERR', error: err.message, ok: false }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 'TIMEOUT', ok: false });
      });
      req.end();
    } catch (e) {
      resolve({ status: 'EXCEPTION', error: e.message, ok: false });
    }
  });
}

async function verify() {
  console.log('=== VERIFYING PLACE PHOTOGRAPHS IN DATASET & LIVE DB ===');

  let placesWithPhotos = dataset.filter((p) => p.photos && p.photos.length > 0);
  console.log(`Total places in dataset: ${dataset.length}`);
  console.log(`Places in dataset with photos: ${placesWithPhotos.length}`);

  let validUrls = 0;
  let brokenUrls = [];
  let nonWikimedia = [];

  for (let i = 0; i < placesWithPhotos.length; i++) {
    const place = placesWithPhotos[i];
    const photo = place.photos[0];
    const url = photo.url;

    if (!url.startsWith('https://upload.wikimedia.org/')) {
      nonWikimedia.push({ place: place.name, url });
    }

    const check = await checkUrl(url);
    if (check.ok) {
      validUrls++;
    } else {
      brokenUrls.push({ place: place.name, url, status: check.status, error: check.error });
    }
    process.stdout.write(`Checked ${i + 1}/${placesWithPhotos.length}...\r`);
  }

  console.log(`\nURL Verification Complete:`);
  console.log(`- Valid reachable URLs: ${validUrls} / ${placesWithPhotos.length}`);
  console.log(`- Broken / unreachable URLs: ${brokenUrls.length}`);
  if (brokenUrls.length > 0) {
    console.log('Broken details:', brokenUrls);
  }
  console.log(`- Non-Wikimedia URLs: ${nonWikimedia.length}`);

  // Now connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accessable_db';
  console.log(`\nConnecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  const Place = require('../models/Place');
  const totalInDb = await Place.countDocuments();
  const allDbPlaces = await Place.find({}, 'name providerPlaceId photos');
  const dbWithPhotos = allDbPlaces.filter((p) => p.photos && p.photos.length > 0);

  console.log(`Total places in MongoDB: ${totalInDb}`);
  console.log(`Places in MongoDB with photos: ${dbWithPhotos.length}`);

  await mongoose.disconnect();
}

verify().catch(console.error);
