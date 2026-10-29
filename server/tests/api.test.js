const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const app = require('../server');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');

let serverInstance;
let baseUrl;
let testAdminToken;
let testUserToken;
let testUserId;
let testPlaceId;

test.before(async () => {
  // Connect to test database or local db
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accessable_db';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // Start server on an ephemeral port
  await new Promise((resolve) => {
    serverInstance = app.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await mongoose.connection.close();
});

test('GET /api/health should return ok status', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'AccessAble API');
});

test('POST /api/auth/register should register a new user and return token', async () => {
  const randomEmail = `testuser_${Date.now()}@test.org`;
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Integration Test User',
      email: randomEmail,
      password: 'password123',
      role: 'user'
    })
  });
  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.email, randomEmail);
  testUserToken = data.token;
  testUserId = data.user.id;
});

test('POST /api/auth/login should authenticate user with correct credentials', async () => {
  const randomEmail = `admin_test_${Date.now()}@test.org`;
  // Create an admin user directly
  const adminUser = await User.create({
    name: 'Test Admin',
    email: randomEmail,
    password: 'adminPassword123',
    role: 'admin'
  });

  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: randomEmail,
      password: 'adminPassword123'
    })
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.role, 'admin');
  testAdminToken = data.token;
});

test('POST /api/places should create a place with accessibility facilities', async () => {
  const placePayload = {
    name: 'City General Medical Clinic',
    description: 'Outpatient clinic with low-slope entrance and braille elevator.',
    category: 'Hospital',
    address: '77 Wellness Way',
    city: 'Metropolis',
    state: 'Capital Region',
    facilities: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available',
      accessibleToilet: 'Available',
      accessibleParking: 'Available',
      brailleSignage: 'Unavailable',
      audioAssistance: 'Unknown'
    },
    facilityNotes: {
      wheelchairRamp: 'Slope 1:12 with non-skid rubber surface.'
    }
  };

  const res = await fetch(`${baseUrl}/api/places`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${testUserToken}`
    },
    body: JSON.stringify(placePayload)
  });
  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.data.name, 'City General Medical Clinic');
  assert.equal(data.data.facilities.wheelchairRamp, 'Available');
  assert.equal(data.data.facilities.audioAssistance, 'Unknown');
  testPlaceId = data.data._id;
});

test('GET /api/places should filter places by category and facility', async () => {
  const res = await fetch(
    `${baseUrl}/api/places?category=Hospital&wheelchairRamp=Available`
  );
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
  assert.equal(data.data[0].category, 'Hospital');
  assert.equal(data.data[0].facilities.wheelchairRamp, 'Available');
});

test('POST /api/reviews/place/:id should add a review and update ratings', async () => {
  const reviewPayload = {
    rating: 5,
    accessibilityRating: 4,
    comment: 'Great accessibility ramp at the main reception entrance.',
    facilityFeedback: {
      wheelchairRamp: 'Available',
      elevatorLift: 'Available'
    }
  };

  const res = await fetch(`${baseUrl}/api/reviews/place/${testPlaceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${testUserToken}`
    },
    body: JSON.stringify(reviewPayload)
  });
  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.data.rating, 5);
  assert.equal(data.data.accessibilityRating, 4);

  // Check that place average rating is recalculated
  const placeRes = await fetch(`${baseUrl}/api/places/${testPlaceId}`);
  const placeData = await placeRes.json();
  assert.equal(placeRes.status, 200);
  assert.equal(placeData.data.averageRating, 5);
  assert.equal(placeData.data.averageAccessibilityRating, 4);
  assert.equal(placeData.data.totalReviews, 1);
});

test('GET /api/places/stats/overview should restrict non-admin and permit admin', async () => {
  // Non-admin attempt -> should be 403 Forbidden
  const forbiddenRes = await fetch(`${baseUrl}/api/places/stats/overview`, {
    headers: { Authorization: `Bearer ${testUserToken}` }
  });
  assert.equal(forbiddenRes.status, 403);

  // Admin attempt -> should be 200 OK
  const adminRes = await fetch(`${baseUrl}/api/places/stats/overview`, {
    headers: { Authorization: `Bearer ${testAdminToken}` }
  });
  const adminData = await adminRes.json();
  assert.equal(adminRes.status, 200);
  assert.equal(adminData.success, true);
  assert.ok(adminData.stats.totalPlaces >= 1);
});
