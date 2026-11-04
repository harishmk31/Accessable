const test = require('node:test');
const assert = require('node:assert/strict');
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
const Report = require('../models/Report');

let serverInstance;
let baseUrl;
let samplePlaceId;

test.before(async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  const place = await Place.findOne({ city: 'Coimbatore' });
  if (place) {
    samplePlaceId = place._id.toString();
  }
});

test.after(async () => {
  // Clean up any test-submitted inaccuracy reports
  await Report.deleteMany({ reporterEmail: 'auditor@example.org' });
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await mongoose.connection.close();
});

test('GET /api/places/categories should return category aggregates', async () => {
  const res = await fetch(`${baseUrl}/api/places/categories`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
  assert.ok(data.data[0].category);
  assert.ok(typeof data.data[0].count === 'number');
});

test('GET /api/places/districts should return district and locality coverage', async () => {
  const res = await fetch(`${baseUrl}/api/places/districts`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  const cbe = data.data.find((d) => d.district === 'Coimbatore');
  assert.ok(cbe, 'Coimbatore district should be present in coverage');
  assert.ok(cbe.count >= 1);
});

test('GET /api/places/nearby should return places near Coimbatore coordinates with distanceKm', async () => {
  // Coimbatore central coordinates: lat 11.0168, lng 76.9558
  const res = await fetch(`${baseUrl}/api/places/nearby?lat=11.0168&lng=76.9558&radius=10`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
  assert.ok(data.data[0].distanceKm !== undefined);
  assert.ok(data.data[0].distanceKm <= 10);
});

test('GET /api/places/search should find places by locality name', async () => {
  const res = await fetch(`${baseUrl}/api/places/search?q=Peelamedu`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
});

test('GET /api/places/provider/status should report Google Places provider state', async () => {
  const res = await fetch(`${baseUrl}/api/places/provider/status`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.data.provider, 'google_places_new');
  assert.ok(typeof data.data.isConfigured === 'boolean');
});

test('POST /api/places/:id/reports should submit an inaccuracy report', async () => {
  if (!samplePlaceId) return;

  const res = await fetch(`${baseUrl}/api/places/${samplePlaceId}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reporterName: 'Accessibility Auditor',
      reporterEmail: 'auditor@example.org',
      issueCategory: 'incorrect_accessibility',
      description: 'The entrance ramp is temporarily under tile maintenance and requires side access.',
      evidence: 'Audited on site yesterday.'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.data.issueCategory, 'incorrect_accessibility');
  assert.equal(data.data.status, 'pending');
});

test('GET /api/places/regions should return regional aggregations with place counts and districts', async () => {
  const res = await fetch(`${baseUrl}/api/places/regions`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.regions));
  assert.ok(data.regions.length >= 4);

  const western = data.regions.find((r) => r.region === 'Western Tamil Nadu');
  assert.ok(western, 'Western Tamil Nadu should be present in regions');
  assert.ok(western.totalPlaces >= 1);
  assert.ok(Array.isArray(western.districts));
});

test('GET /api/places/coverage should return live coverage statistics across Tamil Nadu', async () => {
  const res = await fetch(`${baseUrl}/api/places/coverage`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.totalPlaces > 0);
  assert.ok(data.districtsCoveredCount > 0);
  assert.ok(Array.isArray(data.districts));
  assert.ok(data.facilities);
  assert.ok(typeof data.facilities.wheelchairRampsAvailable === 'number');
});

test('GET /api/places?region=Western+Tamil+Nadu should filter places by region', async () => {
  const res = await fetch(`${baseUrl}/api/places?region=Western+Tamil+Nadu`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
  data.data.forEach((p) => {
    assert.equal(p.region, 'Western Tamil Nadu');
  });
});
