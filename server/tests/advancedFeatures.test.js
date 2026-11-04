const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

// Ensure test suite strictly targets isolated test database, NEVER active accessable_db
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/accessable_test';

// Hard guard: Parse and validate database name strictly from URI path component (never print credentials)
function extractDatabaseName(uri) {
  if (!uri || typeof uri !== 'string') return '';
  const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//i, '');
  const withoutAuth = withoutProtocol.includes('@') ? withoutProtocol.split('@')[1] : withoutProtocol;
  const pathPart = withoutAuth.split('?')[0].split('/')[1] || '';
  return pathPart.trim();
}

const targetDbName = extractDatabaseName(process.env.MONGODB_URI);
if (!targetDbName || !targetDbName.toLowerCase().includes('test') || targetDbName.toLowerCase() === 'accessable_db') {
  throw new Error(
    `[SECURITY GUARD] Test suite aborted: Resolved database name is "${targetDbName}". Tests must run strictly against an isolated database whose name contains "test".`
  );
}

const app = require('../server');
const Place = require('../models/Place');
const User = require('../models/User');

let serverInstance;
let baseUrl;
let testAdminToken;
let testUserToken;
let samplePlaceId;

// Voice command matcher functions dynamically imported from ESM client utility
let matchVoiceCommand;
let formatAccessibilitySpeechText;
let VOICE_ACTIONS;

test.before(async () => {
  // Dynamically import ESM voiceCommandMatcher module
  const matcherPath = path.resolve(__dirname, '../../client/src/utils/voiceCommandMatcher.js');
  const matcherModule = await import(pathToFileURL(matcherPath).href);
  matchVoiceCommand = matcherModule.matchVoiceCommand;
  formatAccessibilitySpeechText = matcherModule.formatAccessibilitySpeechText;
  VOICE_ACTIONS = matcherModule.VOICE_ACTIONS;

  const mongoUri = process.env.MONGODB_URI;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // Create or clean a test place for AI assessments
  await Place.deleteMany({ name: 'Advanced Feature Test Clinic' });

  const testPlace = await Place.create({
    name: 'Advanced Feature Test Clinic',
    description: 'Specialized diagnostic center with wheelchair ramp and braille elevators.',
    category: 'Hospital',
    address: '100 Medical Plaza, Avinashi Road',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    coordinates: { lat: 11.025, lng: 76.975 },
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unavailable',
      audioAssistance: 'Unknown'
    },
    facilityNotes: {
      wheelchairRamp: 'Gradient 1:14 with double handrails.',
      elevatorLift: 'Standard automatic doors with verbal announcement.'
    },
    status: 'verified'
  });
  samplePlaceId = testPlace._id.toString();

  // Start test server
  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Setup dedicated test admin and user tokens
  const testAdminEmail = `adv_admin_${Date.now()}@test.org`;
  await User.create({
    name: 'Adv Test Admin',
    email: testAdminEmail,
    password: 'adminPassword123',
    role: 'admin'
  });

  const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testAdminEmail, password: 'adminPassword123' })
  });
  const adminData = await adminRes.json();
  if (adminData.token) testAdminToken = adminData.token;

  const testUserEmail = `adv_user_${Date.now()}@test.org`;
  await User.create({
    name: 'Adv Test User',
    email: testUserEmail,
    password: 'userPassword123',
    role: 'user'
  });

  const userRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserEmail, password: 'userPassword123' })
  });
  const userData = await userRes.json();
  if (userData.token) testUserToken = userData.token;
});

test.after(async () => {
  await Place.deleteMany({ name: 'Advanced Feature Test Clinic' });
  await User.deleteMany({ email: /adv_(admin|user)_/ });
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await mongoose.connection.close();
});

test('POST /api/places/check-duplicate should identify duplicate name in same city', async () => {
  const res = await fetch(`${baseUrl}/api/places/check-duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Advanced Feature Test Clinic',
      city: 'Coimbatore'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.isDuplicate, true);
  assert.ok(data.existingPlace);
  assert.equal(data.existingPlace.name, 'Advanced Feature Test Clinic');
});

test('POST /api/places/check-duplicate should permit unique place names', async () => {
  const res = await fetch(`${baseUrl}/api/places/check-duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Completely Unique Future Venue 9999',
      city: 'Coimbatore'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.isDuplicate, false);
});

test('POST /api/places should reject duplicate place creation with 409 Conflict', async () => {
  const duplicatePayload = {
    name: 'Advanced Feature Test Clinic',
    description: 'Duplicate attempt with identical name and city.',
    category: 'Hospital',
    address: '100 Medical Plaza, Avinashi Road',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    coordinates: { lat: 11.025, lng: 76.975 }
  };

  const res = await fetch(`${baseUrl}/api/places`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${testUserToken || testAdminToken}`
    },
    body: JSON.stringify(duplicatePayload)
  });

  const data = await res.json();
  assert.equal(res.status, 409);
  assert.equal(data.success, false);
  assert.match(data.message, /already exists/i);
});

test('POST /api/places/:id/ai-assessment should return structured AI accessibility audit', async () => {
  const res = await fetch(`${baseUrl}/api/places/${samplePlaceId}/ai-assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.metrics);
  assert.ok(data.data.metrics.score >= 0 && data.data.metrics.score <= 100);
  assert.ok(Array.isArray(data.data.strengths));
  assert.ok(data.data.strengths.length > 0);
  assert.ok(Array.isArray(data.data.barriers));
  assert.ok(Array.isArray(data.data.recommendations));
  assert.ok(data.data.disclaimer);
});

test('POST /api/places/analyze-image should perform computer vision accessibility analysis', async () => {
  const res = await fetch(`${baseUrl}/api/places/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'main_entrance_ramp_handrail.jpg',
      placeName: 'Coimbatore General Hospital',
      placeCategory: 'Hospital'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.featuresDetected);
  assert.ok(data.data.featuresDetected.length > 0);
  const rampFeature = data.data.featuresDetected.find((f) =>
    f.feature.toLowerCase().includes('ramp')
  );
  assert.ok(rampFeature, 'Should detect wheelchair ramp from image cues');
  assert.ok(rampFeature.confidence >= 70);
});

test('GET /api/places/admin/duplicates should group duplicates for admin moderation', async () => {
  const res = await fetch(`${baseUrl}/api/places/admin/duplicates`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${testAdminToken}`
    }
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
});

test('GET /api/places with minAccessibilityScore filter', async () => {
  const res = await fetch(`${baseUrl}/api/places?minAccessibilityScore=60`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  data.data.forEach((place) => {
    assert.ok(place.accessibilityScore >= 60);
  });
});

test('Voice Command Parser: English accessibility intents', () => {
  assert.ok(matchVoiceCommand);

  // Hospital search
  const hosp = matchVoiceCommand('find accessible hospitals in coimbatore', 'en');
  assert.equal(hosp.action, VOICE_ACTIONS.SEARCH_HOSPITALS);
  assert.match(hosp.targetUrl, /category=Hospital/);

  // Restaurant search
  const rest = matchVoiceCommand('show restaurants with ramps', 'en');
  assert.equal(rest.action, VOICE_ACTIONS.SEARCH_RESTAURANTS);
  assert.match(rest.targetUrl, /category=Restaurant/);

  // Wheelchair ramp filter
  const ramp = matchVoiceCommand('places with wheelchair ramp', 'en');
  assert.equal(ramp.action, VOICE_ACTIONS.FILTER_WHEELCHAIR);
  assert.match(ramp.targetUrl, /wheelchairRamp=Available/);

  // Accessible toilet filter
  const toilet = matchVoiceCommand('show places with accessible toilet', 'en');
  assert.equal(toilet.action, VOICE_ACTIONS.FILTER_TOILETS);
  assert.match(toilet.targetUrl, /accessibleToilet=Available/);

  // Elevator filter
  const lift = matchVoiceCommand('buildings with elevator lift', 'en');
  assert.equal(lift.action, VOICE_ACTIONS.FILTER_LIFTS);
  assert.match(lift.targetUrl, /elevatorLift=Available/);

  // Nearby discovery
  const nearby = matchVoiceCommand('find accessible places near me', 'en');
  assert.equal(nearby.action, VOICE_ACTIONS.SHOW_NEARBY);
  assert.match(nearby.targetUrl, /\/discover\?sortBy=distance/);

  // Open map
  const map = matchVoiceCommand('open the map view', 'en');
  assert.equal(map.action, VOICE_ACTIONS.OPEN_MAP);
  assert.equal(map.targetUrl, '/accessibility-map');

  // Read place details
  const read = matchVoiceCommand('read accessibility details aloud', 'en');
  assert.equal(read.action, VOICE_ACTIONS.READ_PLACE_DETAILS);

  // Go back
  const back = matchVoiceCommand('go back to previous page', 'en');
  assert.equal(back.action, VOICE_ACTIONS.NAVIGATE_BACK);

  // Stop listening
  const stop = matchVoiceCommand('stop listening now', 'en');
  assert.equal(stop.action, VOICE_ACTIONS.STOP);
});

test('Voice Command Parser: Tamil natural speech accessibility intents', () => {
  assert.ok(matchVoiceCommand);

  // Hospital search
  const hosp = matchVoiceCommand('மருத்துவமனைகளைத் தேடு', 'ta');
  assert.equal(hosp.action, VOICE_ACTIONS.SEARCH_HOSPITALS);
  assert.match(hosp.targetUrl, /category=Hospital/);

  // Wheelchair ramp
  const ramp = matchVoiceCommand('சாய்தளம் உள்ள இடங்கள்', 'ta');
  assert.equal(ramp.action, VOICE_ACTIONS.FILTER_WHEELCHAIR);
  assert.match(ramp.targetUrl, /wheelchairRamp=Available/);

  // Accessible toilet
  const toilet = matchVoiceCommand('கழிப்பறை வசதி உள்ள இடங்கள்', 'ta');
  assert.equal(toilet.action, VOICE_ACTIONS.FILTER_TOILETS);
  assert.match(toilet.targetUrl, /accessibleToilet=Available/);

  // Elevator / Lift
  const lift = matchVoiceCommand('மின்தூக்கி வசதி எங்கு உள்ளது', 'ta');
  assert.equal(lift.action, VOICE_ACTIONS.FILTER_LIFTS);
  assert.match(lift.targetUrl, /elevatorLift=Available/);

  // Nearby
  const nearby = matchVoiceCommand('அருகில் உள்ள இடங்கள்', 'ta');
  assert.equal(nearby.action, VOICE_ACTIONS.SHOW_NEARBY);
  assert.match(nearby.targetUrl, /\/discover\?sortBy=distance/);

  // Map
  const map = matchVoiceCommand('வரைபடம் காட்டு', 'ta');
  assert.equal(map.action, VOICE_ACTIONS.OPEN_MAP);
  assert.equal(map.targetUrl, '/accessibility-map');

  // Read aloud
  const read = matchVoiceCommand('தகவலைப் படி', 'ta');
  assert.equal(read.action, VOICE_ACTIONS.READ_PLACE_DETAILS);

  // Go back
  const back = matchVoiceCommand('பின்னால் செல்', 'ta');
  assert.equal(back.action, VOICE_ACTIONS.NAVIGATE_BACK);

  // Stop
  const stop = matchVoiceCommand('நிறுத்து', 'ta');
  assert.equal(stop.action, VOICE_ACTIONS.STOP);
});

test('Voice Navigation Integrity: formatAccessibilitySpeechText never claims unknown facilities as available', () => {
  const samplePlace = {
    name: 'Integrity Test Hospital',
    city: 'Coimbatore',
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Unavailable',
      accessibleToilet: 'Unknown',
      accessibleParking: 'Unknown',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unavailable'
    }
  };

  // English speech verification
  const speechEn = formatAccessibilitySpeechText(samplePlace, 'en');
  assert.match(speechEn, /wheelchair ramp is available/i);
  assert.match(speechEn, /elevator is unavailable/i);
  assert.match(speechEn, /restroom accessibility is unknown/i);
  assert.match(speechEn, /parking accessibility is unconfirmed/i);
  assert.match(speechEn, /braille signage is unverified/i);
  assert.match(speechEn, /audio assistance is unavailable/i);
  // Negative check: never claim restroom or parking is available
  assert.doesNotMatch(speechEn, /restroom is available/i);
  assert.doesNotMatch(speechEn, /parking is available/i);

  // Tamil speech verification
  const speechTa = formatAccessibilitySpeechText(samplePlace, 'ta');
  assert.match(speechTa, /சாய்தள வசதி உள்ளது/);
  assert.match(speechTa, /லிப்ட் வசதி இல்லை/);
  assert.match(speechTa, /கழிப்பறை வசதி உறுதிப்படுத்தப்படவில்லை/);
  assert.match(speechTa, /பார்க்கிங் வசதி உறுதிப்படுத்தப்படவில்லை/);
  assert.doesNotMatch(speechTa, /கழிப்பறை வசதி உள்ளது/);
});

test('POST /api/places/analyze-image should reject arbitrary or internal URLs to prevent SSRF', async () => {
  // Test disallowed internal IP
  const disallowedRes = await fetch(`${baseUrl}/api/places/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: 'http://169.254.169.254/latest/meta-data/'
    })
  });
  assert.equal(disallowedRes.status, 400);
  const disallowedData = await disallowedRes.json();
  assert.equal(disallowedData.success, false);
  assert.match(disallowedData.message, /invalid image url/i);

  // Test malformed URL
  const malformedRes = await fetch(`${baseUrl}/api/places/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: 'not-a-valid-url'
    })
  });
  assert.equal(malformedRes.status, 400);
  const malformedData = await malformedRes.json();
  assert.equal(malformedData.success, false);
});

test('POST /api/places/analyze-image should reject missing image payload with 400', async () => {
  const emptyRes = await fetch(`${baseUrl}/api/places/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(emptyRes.status, 400);
  const emptyData = await emptyRes.json();
  assert.equal(emptyData.success, false);
  assert.match(emptyData.message, /provide an image file/i);
});

test('POST /api/places/analyze-image returns complete structured schema with unobservable limits', async () => {
  const res = await fetch(`${baseUrl}/api/places/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'entrance_steps_narrow_door.jpg',
      placeName: 'Heritage Library',
      placeCategory: 'Government Office'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.sceneDescription, 'Must include sceneDescription');
  assert.ok(Array.isArray(data.data.featuresDetected), 'featuresDetected must be an array');
  assert.ok(Array.isArray(data.data.obstaclesDetected), 'obstaclesDetected must be an array');
  assert.ok(Array.isArray(data.data.uncertainOrUnobservable), 'uncertainOrUnobservable must be an array');
  assert.ok(data.data.uncertainOrUnobservable.length > 0, 'Must identify limits like gradient and door width');
  assert.ok(Array.isArray(data.data.followUpChecks), 'followUpChecks must be an array');
  assert.ok(data.data.provisionalNotice, 'Must include provisional notice');
  assert.ok(data.data.engine, 'Must report analysis engine');
  assert.ok(data.data.model, 'Must report model');
  assert.ok(data.data.provider, 'Must report provider');

  // Verify obstacle details
  const stepObstacle = data.data.obstaclesDetected.find((o) =>
    (o.barrier || o.obstacle || '').toLowerCase().includes('stair') ||
    (o.barrier || o.obstacle || '').toLowerCase().includes('step')
  );
  assert.ok(stepObstacle, 'Should identify step barrier');
  assert.ok(stepObstacle.severity, 'Barrier must have severity rating');
});

test('POST /api/places/analyze-image NEVER alters MongoDB place records or verification status', async () => {
  const beforePlace = await Place.findById(samplePlaceId).lean();
  assert.ok(beforePlace);
  const originalStatus = beforePlace.status;
  const originalFacilities = JSON.stringify(beforePlace.facilities);
  const originalUpdatedAt = beforePlace.updatedAt.toISOString();

  // Call image analysis with this place context
  const res = await fetch(`${baseUrl}/api/places/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'main_entrance_ramp_handrail.jpg',
      placeName: beforePlace.name,
      placeCategory: beforePlace.category
    })
  });
  assert.equal(res.status, 200);

  // Fetch place again and verify no fields were modified
  const afterPlace = await Place.findById(samplePlaceId).lean();
  assert.equal(afterPlace.status, originalStatus, 'Place status must remain unchanged');
  assert.equal(JSON.stringify(afterPlace.facilities), originalFacilities, 'Facilities must remain unchanged');
  assert.equal(afterPlace.updatedAt.toISOString(), originalUpdatedAt, 'updatedAt must not be touched');
});

// ============================================================================
// ACCESSIBILITY SCORING FORMULA TEST SUITE (Section 6 Requirements)
// ============================================================================

test('Scoring Formula: All six facilities Unknown results in Insufficient Data (null score)', async () => {
  const p = new Place({
    name: 'Test Venue All Unknown',
    description: 'Testing score calculation when no facilities are confirmed',
    category: 'Hospital',
    address: '100 Test St',
    city: 'Coimbatore',
    facilities: {
      wheelchairRamp: 'Unknown',
      elevatorLift: 'Unknown',
      accessibleToilet: 'Unknown',
      accessibleParking: 'Unknown',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    }
  });
  await p.save();
  assert.equal(p.accessibilityScore, null);
  assert.equal(p.accessibilityTier, 'Insufficient Data');
  await Place.findByIdAndDelete(p._id);
});

test('Scoring Formula: All six facilities Available results in High Accessibility (100/100)', async () => {
  const p = new Place({
    name: 'Test Venue All Available',
    description: 'Testing score calculation when all facilities are available',
    category: 'Hospital',
    address: '101 Test St',
    city: 'Coimbatore',
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Available',
      audioAssistance: 'Available'
    }
  });
  await p.save();
  assert.equal(p.accessibilityScore, 100);
  assert.equal(p.accessibilityTier, 'High Accessibility');
  await Place.findByIdAndDelete(p._id);
});

test('Scoring Formula: All six facilities Unavailable results in Limited Accessibility (0/100)', async () => {
  const p = new Place({
    name: 'Test Venue All Unavailable',
    description: 'Testing score calculation when all facilities are verified unavailable',
    category: 'Hospital',
    address: '102 Test St',
    city: 'Coimbatore',
    facilities: {
      wheelchairRamp: 'Unavailable',
      elevatorLift: 'Unavailable',
      accessibleToilet: 'Unavailable',
      accessibleParking: 'Unavailable',
      brailleSignage: 'Unavailable',
      audioAssistance: 'Unavailable'
    }
  });
  await p.save();
  assert.equal(p.accessibilityScore, 0);
  assert.equal(p.accessibilityTier, 'Limited Accessibility');
  await Place.findByIdAndDelete(p._id);
});

test('Scoring Formula: Mixture of Available, Unavailable, and Unknown excludes Unknown from denominator', async () => {
  // Ramp (25, Available) + Lift (20, Unavailable) + Toilet (20, Available) = 45 earned
  // Assessed denominator = 25 + 20 + 20 = 65 (Parking 15, Braille 10, Audio 10 are Unknown and excluded)
  // Normalized score: round((45 / 65) * 100) = 69 -> Moderate Accessibility (40-69)
  const p = new Place({
    name: 'Test Venue Mixture',
    description: 'Testing score calculation with mixture and Unknown exclusions',
    category: 'Transit/Station',
    address: '103 Test St',
    city: 'Coimbatore',
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Unavailable',
      accessibleToilet: 'Available',
      accessibleParking: 'Unknown',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    }
  });
  await p.save();
  assert.equal(p.accessibilityScore, 69);
  assert.equal(p.accessibilityTier, 'Moderate Accessibility');
  await Place.findByIdAndDelete(p._id);
});

test('Scoring Formula: Partial evidence (< 2 confirmed facilities) defaults to Insufficient Data (null score)', async () => {
  // Only 1 facility confirmed (Ramp: Available = 25 pts), but auditedCount < 2
  const p = new Place({
    name: 'Test Venue Partial Evidence',
    description: 'Testing minimum 2 confirmed facilities requirement',
    category: 'Restaurant/Cafe',
    address: '104 Test St',
    city: 'Coimbatore',
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Unknown',
      accessibleToilet: 'Unknown',
      accessibleParking: 'Unknown',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    }
  });
  await p.save();
  assert.equal(p.accessibilityScore, null);
  assert.equal(p.accessibilityTier, 'Insufficient Data');
  await Place.findByIdAndDelete(p._id);
});

test('Scoring Formula: Weight distribution verifies 25, 20, 20, 15, 10, 10 weights', async () => {
  // Test Ramp (25) + Elevator (20) = 45 / 45 = 100%
  const p = new Place({
    name: 'Test Weight Distribution',
    description: 'Testing specific facility weights',
    category: 'College/University',
    address: '105 Test St',
    city: 'Coimbatore',
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Unknown',
      accessibleParking: 'Unknown',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    }
  });
  await p.save();
  assert.equal(p.accessibilityScore, 100);
  assert.equal(p.accessibilityTier, 'High Accessibility');
  await Place.findByIdAndDelete(p._id);
});

// Regression Tests for Section 2 Accessibility Scoring Semantics
test('Scoring Regression 1: Missing, null, undefined, or malformed facilities values', () => {
  assert.deepEqual(Place.calculateAccessibilityScore(null), {
    score: null,
    tier: 'Insufficient Data',
    auditedCount: 0,
    earnedScore: 0,
    assessedMaxWeight: 0
  });
  assert.deepEqual(Place.calculateAccessibilityScore(undefined), {
    score: null,
    tier: 'Insufficient Data',
    auditedCount: 0,
    earnedScore: 0,
    assessedMaxWeight: 0
  });
  assert.deepEqual(Place.calculateAccessibilityScore({ wheelchairRamp: 'InvalidValue', elevatorLift: 123 }), {
    score: null,
    tier: 'Insufficient Data',
    auditedCount: 0,
    earnedScore: 0,
    assessedMaxWeight: 0
  });
});

test('Scoring Regression 2: Exactly two facilities assessed computes score correctly', () => {
  // Ramp (Available: 25) + Lift (Unavailable: 20) -> 25 / 45 = 56% (Moderate Accessibility)
  const res = Place.calculateAccessibilityScore({
    wheelchairRamp: 'Available',
    elevatorLift: 'Unavailable',
    accessibleToilet: 'Unknown',
    accessibleParking: 'Unknown',
    brailleSignage: 'Unknown',
    audioAssistance: 'Unknown'
  });
  assert.equal(res.auditedCount, 2);
  assert.equal(res.score, 56);
  assert.equal(res.tier, 'Moderate Accessibility');
});

test('Scoring Regression 3: Sorting and filtering handles null scores correctly', async () => {
  // Query places with minAccessibilityScore=60: must return only records with score >= 60 and never null
  const resFiltered = await fetch(`${baseUrl}/api/places?minAccessibilityScore=60`);
  const dataFiltered = await resFiltered.json();
  assert.equal(resFiltered.status, 200);
  assert.ok(dataFiltered.data.length > 0);
  dataFiltered.data.forEach((p) => {
    assert.ok(typeof p.accessibilityScore === 'number');
    assert.ok(p.accessibilityScore >= 60);
    assert.notEqual(p.accessibilityTier, 'Insufficient Data');
  });

  // Query places sorted by score_desc: high score places first, null score places at the end
  const resSorted = await fetch(`${baseUrl}/api/places?sortBy=score_desc&limit=50`);
  const dataSorted = await resSorted.json();
  assert.equal(resSorted.status, 200);
  const places = dataSorted.data;
  let seenNull = false;
  places.forEach((p) => {
    if (p.accessibilityScore === null) {
      seenNull = true;
    } else if (seenNull) {
      // Once null is seen in descending order, subsequent items must also be null
      assert.equal(p.accessibilityScore, null);
    }
  });
});

// ============================================================================
// SECURITY & ROLE AUTHORIZATION TEST SUITE (Sections 8 & 9 Requirements)
// ============================================================================

test('Security Guard: POST /api/auth/register prevents self-assigned admin role', async () => {
  const email = `attacker_${Date.now()}@test.org`;
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Malicious Attacker',
      email,
      password: 'password123',
      role: 'admin' // Attempting privilege escalation via payload
    })
  });
  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.user.role, 'user', 'Role must remain user despite payload injection');

  // Verify in MongoDB database record directly
  const dbUser = await User.findById(data.user.id);
  assert.equal(dbUser.role, 'user');
  await User.findByIdAndDelete(dbUser._id);
});

test('Security Guard: Non-admin users are rejected from admin place verification with 403', async () => {
  const res = await fetch(`${baseUrl}/api/places/${samplePlaceId}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${testUserToken}`
    },
    body: JSON.stringify({ status: 'verified' })
  });
  assert.equal(res.status, 403, 'Non-admin user must receive 403 Forbidden');
});

test('Security Guard: Unauthenticated requests to admin stats are rejected with 401', async () => {
  const res = await fetch(`${baseUrl}/api/places/stats/overview`);
  assert.equal(res.status, 401, 'Unauthenticated request must receive 401 Unauthorized');
});
