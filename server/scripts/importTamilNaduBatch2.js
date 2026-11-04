/**
 * AccessAble Idempotent Tamil Nadu Places Data Enrichment Importer - Batch 2
 * 
 * Usage:
 *   node server/scripts/importTamilNaduBatch2.js --dry-run
 *   node server/scripts/importTamilNaduBatch2.js --database accessable_test
 *   node server/scripts/importTamilNaduBatch2.js --database accessable_db --confirm-production
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Place = require('../models/Place');
const { BATCH_2_NEW_PLACES, EXISTING_PHOTO_ENRICHMENTS } = require('./enrichmentBatch2');
const { validateCoordinates, normalizeDistrictName, getRegionForDistrict } = require('../services/geoService');

const isDryRun = process.argv.includes('--dry-run');
const isConfirmedProduction = process.argv.includes('--confirm-production');
const batchSizeArgIdx = process.argv.indexOf('--batch-size');
const batchSize = batchSizeArgIdx > -1 ? parseInt(process.argv[batchSizeArgIdx + 1], 10) : Infinity;

const dbArgIdx = process.argv.indexOf('--database');
const targetDbName = dbArgIdx > -1 ? process.argv[dbArgIdx + 1] : 'accessable_test';

async function runImporter() {
  console.log('====================================================');
  console.log('AccessAble Tamil Nadu Data Enrichment Importer - Batch 2');
  console.log('====================================================');
  console.log(`Mode: ${isDryRun ? 'DRY RUN (Read-Only Simulation)' : 'LIVE DATABASE COMMIT'}`);
  console.log(`Target Database: ${targetDbName}`);
  console.log(`Batch 2 Records: ${Math.min(BATCH_2_NEW_PLACES.length, batchSize)}`);
  console.log(`Photo Enrichments: ${EXISTING_PHOTO_ENRICHMENTS.length}`);

  // Production Guard
  if (targetDbName === 'accessable_db' && !isDryRun && !isConfirmedProduction) {
    console.error('\n[SAFETY GUARD ERROR] Cannot run live modifications against "accessable_db" without explicit --confirm-production flag.');
    process.exit(1);
  }

  const localHost = process.env.LOCAL_MONGODB_HOST || '127.0.0.1:27017';
  const connectionUri = `mongodb://${localHost}/${targetDbName}`;

  try {
    await mongoose.connect(connectionUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to MongoDB: ${targetDbName}\n`);

    let newCount = 0;
    let enrichedCount = 0;
    let skippedCount = 0;
    let invalidCount = 0;

    // Phase 1: Enrich Existing Places with Verified Photos
    console.log('--- Phase 1: Enriching Existing Landmarks with Attributed Photos ---');
    for (const item of EXISTING_PHOTO_ENRICHMENTS) {
      const existing = await Place.findOne({
        name: { $regex: new RegExp(`^${item.matchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        district: { $regex: new RegExp(`^${item.district}$`, 'i') }
      });

      if (existing) {
        const currentUrl = existing.photos?.[0]?.url || existing.images?.[0] || '';
        const hasGenuinePhoto = currentUrl && !currentUrl.includes('images.unsplash.com');
        if (!hasGenuinePhoto) {
          if (!isDryRun) {
            existing.photos = [item.photo];
            existing.images = [item.photo.url];
            await existing.save();
          }
          console.log(`[PHOTO ENRICHED] "${existing.name}" (${existing.district}) with genuine Commons photo: "${item.photo.title}"`);
          enrichedCount++;
        } else {
          console.log(`[PHOTO PRESERVED] "${existing.name}" already has photo.`);
          skippedCount++;
        }
      } else {
        console.warn(`[NOT FOUND FOR ENRICHMENT] "${item.matchName}" in ${item.district}`);
      }
    }

    // Phase 2: Insert or Enrich Batch 2 New Places
    console.log('\n--- Phase 2: Processing Batch 2 Public Places ---');
    const recordsToProcess = BATCH_2_NEW_PLACES.slice(0, batchSize);

    for (const item of recordsToProcess) {
      // 1. Validation
      const isValid = validateCoordinates(item.coordinates.lat, item.coordinates.lng);
      if (!isValid) {
        console.error(`[INVALID COORDINATES] ${item.name}: (${item.coordinates.lat}, ${item.coordinates.lng})`);
        invalidCount++;
        continue;
      }

      const normDistrict = normalizeDistrictName(item.district);
      const region = getRegionForDistrict(normDistrict);

      // 2. Duplicate Detection
      const existingPlace = await Place.findOne({
        $or: [
          ...(item.providerPlaceId ? [{ providerPlaceId: item.providerPlaceId }] : []),
          {
            district: { $regex: new RegExp(`^${normDistrict}$`, 'i') },
            name: { $regex: new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          }
        ]
      });

      if (existingPlace) {
        let modified = false;
        const updates = [];

        if ((!existingPlace.photos || existingPlace.photos.length === 0) && item.photos && item.photos.length > 0) {
          if (!isDryRun) existingPlace.photos = item.photos;
          updates.push('photos');
          modified = true;
        }

        if (!existingPlace.locationSource && item.locationSource) {
          if (!isDryRun) existingPlace.locationSource = item.locationSource;
          updates.push('locationSource');
          modified = true;
        }

        if (!existingPlace.providerPlaceId && item.providerPlaceId) {
          if (!isDryRun) existingPlace.providerPlaceId = item.providerPlaceId;
          updates.push('providerPlaceId');
          modified = true;
        }

        if (modified) {
          console.log(`[ENRICHED] Existing record "${existingPlace.name}" (${existingPlace.district}) enriched with: ${updates.join(', ')}`);
          if (!isDryRun) await existingPlace.save();
          enrichedCount++;
        } else {
          console.log(`[SKIPPED / UNCHANGED] "${item.name}" already fully populated in ${existingPlace.district}.`);
          skippedCount++;
        }
      } else {
        console.log(`[NEW PLACE INSERTION] "${item.name}" -> Category: ${item.category} | District: ${normDistrict} (${region})`);

        if (!isDryRun) {
          const newPlace = new Place({
            ...item,
            district: normDistrict,
            region,
            location: {
              type: 'Point',
              coordinates: [item.coordinates.lng, item.coordinates.lat]
            },
            status: 'verified',
            isSampleData: false,
            verificationSource: 'AccessAble Tamil Nadu Verified Dataset',
            lastVerifiedAt: new Date()
          });

          await newPlace.save();
        }
        newCount++;
      }
    }

    console.log('\n====================================================');
    console.log('BATCH 2 IMPORT SUMMARY');
    console.log('====================================================');
    console.log(`Total Records Evaluated: ${recordsToProcess.length + EXISTING_PHOTO_ENRICHMENTS.length}`);
    console.log(`New Places Inserted:     ${newCount}`);
    console.log(`Existing Records Enriched:${enrichedCount}`);
    console.log(`Existing Skipped/No-op:  ${skippedCount}`);
    console.log(`Invalid Records:         ${invalidCount}`);
    console.log('====================================================');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Batch 2 Importer failed:', err);
    process.exit(1);
  }
}

runImporter();
