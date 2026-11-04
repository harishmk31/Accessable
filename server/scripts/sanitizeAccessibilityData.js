/**
 * AccessAble — Accessibility Data Integrity Sanitization Script
 * 
 * Enforces rigorous distinction between venue identity verification (name, address, GPS)
 * and physical accessibility verification (on-site audits & official compliance docs).
 * 
 * Sets unverified accessibility claims to "Unknown" rather than assuming "Available".
 * Recomputes accessibility scores and tiers accordingly.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Place = require('../models/Place');
const placeIngestionService = require('../services/placeIngestionService');

dotenv.config({ path: __dirname + '/../.env' });

async function sanitizeData() {
  console.log('[Sanitize] Initializing database connection via connectDB...');
  await connectDB();

  const places = await Place.find({});
  console.log(`[Sanitize] Auditing ${places.length} places in database...`);

  const facilityKeys = [
    { legacy: 'wheelchairRamp', prof: 'ramp' },
    { legacy: 'elevatorLift', prof: 'lift' },
    { legacy: 'accessibleToilet', prof: 'accessibleToilet' },
    { legacy: 'accessibleParking', prof: 'accessibleParking' },
    { legacy: 'brailleSignage', prof: 'brailleSignage' },
    { legacy: 'audioAssistance', prof: 'audioAssistance' }
  ];

  let verifiedFacilitiesCount = 0;
  let resetToUnknownCount = 0;
  let venuesUpdatedCount = 0;

  for (const place of places) {
    let placeModified = false;
    if (!place.accessibilityProfile) place.accessibilityProfile = {};

    facilityKeys.forEach(({ legacy, prof }) => {
      const feat = place.accessibilityProfile[prof] || {};
      const method = feat.verificationMethod || 'unverified';
      const evidence = feat.evidenceSource || 'Not audited yet';
      const notes = feat.notes || place.facilityNotes?.[legacy] || '';

      const isSample = place.isSampleData === true;
      const hasAuditedGroundEvidence =
        !isSample &&
        (method === 'on_site_audit' || method === 'official_venue_data') &&
        evidence !== 'Not audited yet' &&
        evidence !== 'Pending on-site accessibility audit' &&
        notes.trim().length > 0;

      if (hasAuditedGroundEvidence) {
        verifiedFacilitiesCount++;
        // Keep verified available or unavailable status
        if (feat.status === 'Verified Available') {
          place.facilities[legacy] = 'Available';
        } else if (feat.status === 'Verified Unavailable') {
          place.facilities[legacy] = 'Unavailable';
        } else {
          place.facilities[legacy] = 'Unknown';
        }
      } else {
        // Unsupported or unverified claim: set to Unknown
        if (place.facilities[legacy] !== 'Unknown' || feat.status !== 'Unknown') {
          placeModified = true;
          resetToUnknownCount++;
        }

        place.facilities[legacy] = 'Unknown';
        place.accessibilityProfile[prof] = {
          status: 'Unknown',
          evidenceSource: 'Pending on-site accessibility audit',
          verificationMethod: 'unverified',
          lastVerifiedAt: null,
          notes: notes ? (notes.startsWith('[Pending on-site audit]') ? notes : `[Pending on-site audit] ${notes}`) : 'Awaiting physical on-site accessibility inspection.'
        };
      }
    });

    // Recompute score and tier
    const f = place.facilities;
    let score = 0;
    let auditedCount = 0;

    if (f.wheelchairRamp === 'Available') { score += 25; auditedCount++; }
    else if (f.wheelchairRamp === 'Unavailable') { auditedCount++; }

    if (f.elevatorLift === 'Available') { score += 20; auditedCount++; }
    else if (f.elevatorLift === 'Unavailable') { auditedCount++; }

    if (f.accessibleToilet === 'Available') { score += 20; auditedCount++; }
    else if (f.accessibleToilet === 'Unavailable') { auditedCount++; }

    if (f.accessibleParking === 'Available') { score += 15; auditedCount++; }
    else if (f.accessibleParking === 'Unavailable') { auditedCount++; }

    if (f.brailleSignage === 'Available') { score += 10; auditedCount++; }
    else if (f.brailleSignage === 'Unavailable') { auditedCount++; }

    if (f.audioAssistance === 'Available') { score += 10; auditedCount++; }
    else if (f.audioAssistance === 'Unavailable') { auditedCount++; }

    place.accessibilityScore = score;
    if (auditedCount < 2) {
      place.accessibilityTier = 'Insufficient Data';
    } else if (score >= 70) {
      place.accessibilityTier = 'High Accessibility';
    } else if (score >= 40) {
      place.accessibilityTier = 'Moderate Accessibility';
    } else {
      place.accessibilityTier = 'Limited Accessibility';
    }

    await place.save();
    venuesUpdatedCount++;
  }

  console.log(`[Sanitize] Completed sanitization for ${venuesUpdatedCount} venues.`);
  console.log(`[Sanitize] Audited verified features preserved: ${verifiedFacilitiesCount}`);
  console.log(`[Sanitize] Unsupported claims reset to "Unknown": ${resetToUnknownCount}`);

  // Recount in DB
  const rampAvailable = await Place.countDocuments({ 'facilities.wheelchairRamp': 'Available' });
  const rampUnknown = await Place.countDocuments({ 'facilities.wheelchairRamp': 'Unknown' });
  const rampUnavailable = await Place.countDocuments({ 'facilities.wheelchairRamp': 'Unavailable' });

  const liftAvailable = await Place.countDocuments({ 'facilities.elevatorLift': 'Available' });
  const toiletAvailable = await Place.countDocuments({ 'facilities.accessibleToilet': 'Available' });
  const parkingAvailable = await Place.countDocuments({ 'facilities.accessibleParking': 'Available' });

  const highTier = await Place.countDocuments({ accessibilityTier: 'High Accessibility' });
  const modTier = await Place.countDocuments({ accessibilityTier: 'Moderate Accessibility' });
  const limTier = await Place.countDocuments({ accessibilityTier: 'Limited Accessibility' });
  const insTier = await Place.countDocuments({ accessibilityTier: 'Insufficient Data' });

  console.log('\n=== SANITIZED DATABASE METRICS ===');
  console.log('Wheelchair Ramps: Available =', rampAvailable, '| Unavailable =', rampUnavailable, '| Unknown =', rampUnknown);
  console.log('Elevators: Available =', liftAvailable);
  console.log('Accessible Toilets: Available =', toiletAvailable);
  console.log('Accessible Parking: Available =', parkingAvailable);
  console.log('\nAccessibility Tiers:');
  console.log(' - High Accessibility:', highTier);
  console.log(' - Moderate Accessibility:', modTier);
  console.log(' - Limited Accessibility:', limTier);
  console.log(' - Insufficient Data (Awaiting Ground Audit):', insTier);

  const coverage = await placeIngestionService.getCoverageStats();
  console.log('\nUpdated Coverage Service Stats:');
  console.log(JSON.stringify(coverage.facilities, null, 2));

  await mongoose.disconnect();
}

sanitizeData().catch((err) => {
  console.error('[Sanitization Error]', err);
  process.exit(1);
});
