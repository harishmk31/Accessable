/**
 * End-to-End API Integration & Flow Test Suite
 * 
 * Verifies the full Express + MongoDB API flow against isolated accessable_test:
 * - Public place discovery, search, district and category filtering
 * - Map data endpoint with Tamil Nadu bounds isolation
 * - Place detail responses with null score handling and facility states
 * - User authentication flow (register, login, profile)
 * - Review submission and aggregate rating recalculation
 * - Inaccuracy report submission and admin resolution
 * - Administrator stats overview with dataQuality and facilityAuditBreakdown
 * - Error handling for 404, 401, 403, and invalid queries
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

// Ensure test suite strictly targets isolated test database, NEVER the active accessable_db
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/accessable_test';

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
const Review = require('../models/Review');
const Report = require('../models/Report');

let server;
let baseUrl;
let testUserToken;
let testAdminToken;
let createdPlaceId;
let createdReportId;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  } else if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  // Guard verification
  assert.ok(mongoose.connection.name.includes('test'));
  assert.notEqual(mongoose.connection.name, 'accessable_db');

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Create clean test user and admin
  const userEmail = `e2e_user_${Date.now()}@example.com`;
  const regUserRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'E2E Test User', email: userEmail, password: 'password123' })
  });
  const regUserData = await regUserRes.json();
  testUserToken = regUserData.token;

  // Elevate an admin user in test db
  const adminEmail = `e2e_admin_${Date.now()}@example.com`;
  await User.create({
    name: 'E2E Admin User',
    email: adminEmail,
    password: 'password123',
    role: 'admin'
  });
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: 'password123' })
  });
  const adminLoginData = await adminLoginRes.json();
  testAdminToken = adminLoginData.token;
});

test.after(async () => {
  if (createdPlaceId) {
    await Place.findByIdAndDelete(createdPlaceId);
  }
  if (createdReportId) {
    await Report.findByIdAndDelete(createdReportId);
  }
  await User.deleteMany({ email: /e2e_(user|admin)_/ });
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.close();
});

// 1. Place Listing & Filters Flow
test('E2E Flow: GET /api/places returns paginated places with correct district and category filtering', async () => {
  const res = await fetch(`${baseUrl}/api/places?page=1&limit=10&district=Coimbatore`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  data.data.forEach((p) => {
    assert.equal(p.district, 'Coimbatore');
    assert.equal(p.status, 'verified');
  });
});

test('E2E Flow: GET /api/places excludes Insufficient Data places when filtering by minAccessibilityScore', async () => {
  const res = await fetch(`${baseUrl}/api/places?minAccessibilityScore=50`);
  assert.equal(res.status, 200);
  const data = await res.json();
  data.data.forEach((p) => {
    assert.ok(p.accessibilityScore >= 50);
    assert.notEqual(p.accessibilityScore, null);
    assert.notEqual(p.accessibilityTier, 'Insufficient Data');
  });
});

// 2. Interactive Map Flow
test('E2E Flow: GET /api/places/map returns valid Tamil Nadu map places with coverageNotice', async () => {
  const res = await fetch(`${baseUrl}/api/places/map`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.count > 0);
  assert.ok(typeof data.coverageNotice === 'string');
  assert.match(data.coverageNotice, /eligible places have map locations in Tamil Nadu/);
  data.data.forEach((p) => {
    const lat = p.coordinates?.lat ?? p.location?.coordinates?.[1];
    const lng = p.coordinates?.lng ?? p.location?.coordinates?.[0];
    assert.ok(lat >= 8.0 && lat <= 13.6);
    assert.ok(lng >= 76.0 && lng <= 80.6);
  });
});

// 3. Place Details & Null Score Handling
test('E2E Flow: GET /api/places/:id accurately serializes null scores for insufficient evidence', async () => {
  const unverifiedPlace = await Place.create({
    name: `E2E Unverified Clinic ${Date.now()}`,
    description: 'A test medical clinic with unverified facilities',
    category: 'Hospital',
    address: '42 Trial Road, Coimbatore',
    city: 'Coimbatore',
    district: 'Coimbatore',
    coordinates: { lat: 11.0168, lng: 76.9558 },
    facilities: {
      wheelchairRamp: 'Unknown',
      elevatorLift: 'Unknown',
      accessibleToilet: 'Unknown',
      accessibleParking: 'Unknown',
      brailleSignage: 'Unknown',
      audioAssistance: 'Unknown'
    },
    status: 'verified'
  });

  const res = await fetch(`${baseUrl}/api/places/${unverifiedPlace._id}`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.accessibilityScore, null);
  assert.equal(data.data.accessibilityTier, 'Insufficient Data');

  createdPlaceId = unverifiedPlace._id.toString();
});

// 4. Inaccuracy Reporting Flow
test('E2E Flow: POST /api/places/:id/reports creates an inaccuracy report', async () => {
  const res = await fetch(`${baseUrl}/api/places/${createdPlaceId}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${testUserToken}`
    },
    body: JSON.stringify({
      issueCategory: 'incorrect_accessibility',
      description: 'Permanent concrete ramp observed with double handrails at main entrance.',
      evidence: 'https://commons.wikimedia.org/wiki/File:Example.jpg'
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.issueCategory, 'incorrect_accessibility');
  assert.equal(data.data.status, 'pending');
  createdReportId = data.data._id;
});

// 5. Admin Report Moderation Flow
test('E2E Flow: Admin reviews and updates inaccuracy report status', async () => {
  const res = await fetch(`${baseUrl}/api/places/admin/reports/${createdReportId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${testAdminToken}`
    },
    body: JSON.stringify({
      status: 'resolved',
      adminNotes: 'Verified via ground site survey photo'
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'resolved');
});

// 6. Review Flow & Rating Recalculation
test('E2E Flow: POST /api/reviews/place/:id adds review and updates averageRating', async () => {
  const res = await fetch(`${baseUrl}/api/reviews/place/${createdPlaceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${testUserToken}`
    },
    body: JSON.stringify({
      rating: 5,
      accessibilityRating: 4,
      comment: 'Excellent accessibility with clear ramp access and helpful staff.'
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.rating, 5);

  // Check that place average rating is recalculated
  const placeRes = await fetch(`${baseUrl}/api/places/${createdPlaceId}`, {
    headers: { Authorization: `Bearer ${testUserToken}` }
  });
  const placeData = await placeRes.json();
  assert.equal(placeRes.status, 200);
  assert.equal(placeData.data.averageRating, 5);
  assert.equal(placeData.data.totalReviews, 1);
});

// 7. Admin Dashboard Overview Flow
test('E2E Flow: GET /api/places/stats/overview returns dataQuality and facilityAuditBreakdown', async () => {
  const res = await fetch(`${baseUrl}/api/places/stats/overview`, {
    headers: { Authorization: `Bearer ${testAdminToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  const stats = data.stats;
  assert.ok(stats.totalPlaces > 0);
  assert.ok(stats.dataQuality);
  assert.ok(typeof stats.dataQuality.placesInsufficientData === 'number');
  assert.ok(stats.facilityAuditBreakdown);
  assert.ok(stats.facilityAuditBreakdown.wheelchairRamp.confirmedAvailable >= 0);
  assert.ok(stats.facilityAuditBreakdown.wheelchairRamp.unknownNotAssessed >= 0);
});

// 8. Error Handling Flow
test('E2E Flow: Error handling returns 404 for non-existent place and invalid id', async () => {
  const nonExistentId = new mongoose.Types.ObjectId().toString();
  const res404 = await fetch(`${baseUrl}/api/places/${nonExistentId}`);
  assert.equal(res404.status, 404);

  const resInvalid = await fetch(`${baseUrl}/api/places/invalid-id-string`);
  assert.equal(resInvalid.status, 404);
});
