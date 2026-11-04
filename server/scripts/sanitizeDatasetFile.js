const fs = require('fs');
const path = require('path');
const datasetPath = path.join(__dirname, '../data/tamilNaduVerifiedDataset.js');

let content = fs.readFileSync(datasetPath, 'utf8');

// Require the dataset to see what we have
const dataset = require('../data/tamilNaduVerifiedDataset');

console.log(`Original dataset has ${dataset.length} places.`);

// Venues with verified audits that should keep their verified claims
const verifiedVenues = new Set([
  'PSG Hospitals',
  'Ganga Hospital',
  'Ganga Medical Centre & Hospitals',
  'Kovai Medical Center and Hospital (KMCH)',
  'Brookefields Mall',
  'Prozone Mall',
  'Race Course Promenade & Walkway',
  'Race Course Walkway & Promenade',
  'Valankulam Lake Promenade & Boardwalk',
  'Coimbatore Junction Railway Station',
  'Gandhipuram Central Bus Stand',
  'PSG College of Technology',
  'Tamil Nadu Agricultural University (TNAU)',
  'Coimbatore District Collectorate',
  'Sri Naga Sai Mandir',
  'Sree Annapoorna Sree Gowrishankar',
  'Marina Beach Accessible Wooden Pathway',
  'Marina Beach Accessible Wooden Boardwalk',
  'Puratchi Thalaivar Dr. MGR Central Railway Station',
  'Arulmigu Meenakshi Sundareswarar Temple Precincts',
  'Government Botanical Garden Lower Terraces',
  'Brihadisvara Big Temple World Heritage Complex',
  'Brihadisvara Temple (Big Temple) Peripheral Grounds',
  'Kanyakumari Sunset View Point & Beach Promenade'
]);

// Transform dataset
const sanitizedDataset = dataset.map((place) => {
  const isVerifiedVenue = verifiedVenues.has(place.name);
  const p = JSON.parse(JSON.stringify(place));

  if (!p.accessibilityProfile) p.accessibilityProfile = {};

  const facilityKeys = [
    'stepFreeEntrance',
    'ramp',
    'lift',
    'accessibleToilet',
    'accessibleParking',
    'brailleSignage',
    'audioAssistance'
  ];

  facilityKeys.forEach((key) => {
    const feat = p.accessibilityProfile[key] || {};
    const method = feat.verificationMethod || 'unverified';
    const evidence = feat.evidenceSource || 'Not audited yet';

    const hasGroundEvidence =
      isVerifiedVenue &&
      (method === 'on_site_audit' || method === 'official_venue_data' || (feat.notes && feat.status === 'Verified Available'));

    if (!hasGroundEvidence) {
      const existingNotes = feat.notes || '';
      p.accessibilityProfile[key] = {
        status: 'Unknown',
        evidenceSource: 'Pending on-site accessibility audit',
        verificationMethod: 'unverified',
        lastVerifiedAt: null,
        notes: existingNotes
          ? (existingNotes.startsWith('[Pending on-site audit]') ? existingNotes : `[Pending on-site audit] ${existingNotes}`)
          : 'Awaiting physical on-site accessibility inspection.'
      };
    }
  });

  return p;
});

const output = `/**
 * AccessAble — Real Places Verified Dataset for Tamil Nadu
 * 
 * Genuine, identifiable public places across Western, Northern,
 * Central, Southern Tamil Nadu and major tourism destinations.
 * 
 * Strict Photographic Policy:
 * - Genuine Wikimedia Commons / CC-BY-SA photographs for confirmed venues.
 * - Empty photos array for venues awaiting ground photographic audit
 *   (rendered with a neutral, professional "Photo unavailable" placeholder).
 * - Zero random or generic Unsplash stock photos.
 * 
 * Accessibility Data Integrity:
 * - Physical accessibility facility statuses require on-site ground audit
 *   or official compliance declaration. Unaudited venues are marked "Unknown".
 */

const TAMIL_NADU_VERIFIED_PLACES = ${JSON.stringify(sanitizedDataset, null, 2)};

module.exports = TAMIL_NADU_VERIFIED_PLACES;
`;

fs.writeFileSync(datasetPath, output, 'utf8');
console.log('Successfully sanitized and rewrote tamilNaduVerifiedDataset.js');
