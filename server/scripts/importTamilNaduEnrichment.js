/**
 * AccessAble Idempotent Tamil Nadu Places Data Enrichment Importer
 * 
 * Usage:
 *   node server/scripts/importTamilNaduEnrichment.js --dry-run
 *   node server/scripts/importTamilNaduEnrichment.js --database accessable_test
 *   node server/scripts/importTamilNaduEnrichment.js --confirm-production
 * 
 * Safety Rules:
 * - Refuses to modify accessable_db without explicit --confirm-production argument.
 * - Detects duplicates conservatively by providerPlaceId and normalized name + district.
 * - Enriches missing fields (e.g. verified photos, locationSource) on existing places without overwriting reviewed accessibility data.
 * - Never deletes or drops existing records.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Place = require('../models/Place');
const enrichmentDataset = require('./enrichmentDataset');
const { validateCoordinates, normalizeDistrictName, getRegionForDistrict } = require('../services/geoService');

// Parse CLI flags
const isDryRun = process.argv.includes('--dry-run');
const isConfirmedProduction = process.argv.includes('--confirm-production');
const batchSizeArgIdx = process.argv.indexOf('--batch-size');
const batchSize = batchSizeArgIdx > -1 ? parseInt(process.argv[batchSizeArgIdx + 1], 10) : Infinity;

const dbArgIdx = process.argv.indexOf('--database');
const targetDbName = dbArgIdx > -1 ? process.argv[dbArgIdx + 1] : (process.env.MONGODB_URI ? extractDbName(process.env.MONGODB_URI) : 'accessable_test');

function extractDbName(uri) {
  if (!uri || typeof uri !== 'string') return '';
  const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//i, '');
  const withoutAuth = withoutProtocol.includes('@') ? withoutProtocol.split('@')[1] : withoutProtocol;
  const pathPart = withoutAuth.split('?')[0].split('/')[1] || '';
  return pathPart.trim();
}

async function runImporter() {
  console.log('====================================================');
  console.log('AccessAble Tamil Nadu Data Enrichment Importer');
  console.log('====================================================');
  console.log(`Mode: ${isDryRun ? 'DRY RUN (Read-Only Simulation)' : 'LIVE DATABASE COMMIT'}`);
  console.log(`Target Database: ${targetDbName}`);
  console.log(`Dataset Records to Process: ${Math.min(enrichmentDataset.length, batchSize)}`);

  // Production Guard
  if (targetDbName === 'accessable_db' && !isDryRun && !isConfirmedProduction) {
    console.error('\n[SAFETY GUARD ERROR] Cannot run live modifications against "accessable_db" without explicit --confirm-production flag.');
    console.error('To simulate changes without writing to database: node server/scripts/importTamilNaduEnrichment.js --dry-run');
    process.exit(1);
  }

  const localHost = process.env.LOCAL_MONGODB_HOST || '127.0.0.1:27017';
  const connectionUri = `mongodb://${localHost}/${targetDbName}`;

  await mongoose.connect(connectionUri);
  console.log(`Connected to MongoDB: ${targetDbName}\n`);

  let insertedCount = 0;
  let enrichedCount = 0;
  let skippedCount = 0;
  let invalidCount = 0;

  const datasetToProcess = enrichmentDataset.slice(0, batchSize);

  for (const item of datasetToProcess) {
    // 1. Validation
    const lat = item.coordinates?.lat;
    const lng = item.coordinates?.lng;

    if (!validateCoordinates(lat, lng)) {
      console.warn(`[INVALID COORDINATES] Skipped "${item.name}" - coordinates (${lat}, ${lng}) fall outside Tamil Nadu bounds.`);
      invalidCount++;
      continue;
    }

    const normDistrict = normalizeDistrictName(item.district);
    const region = getRegionForDistrict(normDistrict);

    // 2. Conservative Duplicate Detection
    // Check by providerPlaceId first, then by normalized name + district
    const normName = item.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
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
      // Record exists: enrich missing fields only
      let modified = false;
      const updates = [];

      // Enrich photos if existing place lacks genuine photos and item has photos
      if ((!existingPlace.photos || existingPlace.photos.length === 0) && item.photos && item.photos.length > 0) {
        if (!isDryRun) existingPlace.photos = item.photos;
        updates.push('photos');
        modified = true;
      }

      // Enrich locationSource if missing
      if (!existingPlace.locationSource && item.locationSource) {
        if (!isDryRun) existingPlace.locationSource = item.locationSource;
        updates.push('locationSource');
        modified = true;
      }

      // Enrich providerPlaceId if missing
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
      // New record: Insert
      console.log(`[NEW PLACE INSERTION] "${item.name}" -> Category: ${item.category} | District: ${normDistrict} (${region})`);

      if (!isDryRun) {
        const newPlace = new Place({
          ...item,
          district: normDistrict,
          region,
          status: 'verified',
          isSampleData: false,
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        });
        await newPlace.save();
      }
      insertedCount++;
    }
  }

  console.log('\n====================================================');
  console.log('ENRICHMENT IMPORT SUMMARY');
  console.log('====================================================');
  console.log(`Total Records Evaluated: ${datasetToProcess.length}`);
  console.log(`New Places Inserted:     ${insertedCount}`);
  console.log(`Existing Places Enriched:${enrichedCount}`);
  console.log(`Existing Places Skipped: ${skippedCount}`);
  console.log(`Invalid Records:         ${invalidCount}`);
  console.log('====================================================');

  await mongoose.disconnect();
}

runImporter().catch((err) => {
  console.error('\nFatal Importer Error:', err);
  process.exit(1);
});
