const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const app = require('../server');
const Place = require('../models/Place');
const Report = require('../models/Report');

let serverInstance;
let baseUrl;
let samplePlaceId;

test.before(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/accessable_db';
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
