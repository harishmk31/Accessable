const mongoose = require('mongoose');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Report = require('../models/Report');
const User = require('../models/User');
const placeIngestionService = require('../services/placeIngestionService');

async function audit() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accessable_db';
  console.log('Connecting to database:', mongoUri);
  await mongoose.connect(mongoUri);

  const totalPlaces = await Place.countDocuments();
  const verifiedPlaces = await Place.countDocuments({ status: 'verified' });
  const unverifiedPlaces = await Place.countDocuments({ status: { $ne: 'verified' } });

  // Unique names vs duplicate names
  const nameAgg = await Place.aggregate([
    { $group: { _id: { name: '$name', city: '$city' }, count: { $sum: 1 }, ids: { $push: '$_id' } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  // City & District coverage
  const districts = await Place.distinct('district');
  const cities = await Place.distinct('city');
  const regions = await Place.distinct('region');

  // Facilities breakdown
  const facilityKeys = [
    'wheelchairRamp',
    'elevatorLift',
    'accessibleToilet',
    'accessibleParking',
    'brailleSignage',
    'audioAssistance'
  ];

  const facilityBreakdown = {};
  for (const f of facilityKeys) {
    const available = await Place.countDocuments({ [`facilities.${f}`]: 'Available' });
    const unavailable = await Place.countDocuments({ [`facilities.${f}`]: 'Unavailable' });
    const unknown = await Place.countDocuments({
      $or: [{ [`facilities.${f}`]: 'Unknown' }, { [`facilities.${f}`]: { $exists: false } }]
    });
    facilityBreakdown[f] = { available, unavailable, unknown };
  }

  // Photos
  const allPlaces = await Place.find({}, 'name photos');
  const placesWithPhotos = allPlaces.filter((p) => p.photos && p.photos.length > 0);

  // Reviews & ratings
  const totalReviews = await Review.countDocuments();
  const placesWithReviews = await Place.countDocuments({ totalReviews: { $gt: 0 } });
  const reportsCount = await Report.countDocuments();

  // Dashboard coverage stats from service
  const coverageStats = await placeIngestionService.getCoverageStats();

  console.log('\n=== REAL DATABASE AUDIT RESULTS ===');
  console.log('Total Places:', totalPlaces);
  console.log('Verified Places:', verifiedPlaces);
  console.log('Unverified / Pending Places:', unverifiedPlaces);
  console.log('Duplicate (name + city) groups:', nameAgg.length);
  if (nameAgg.length > 0) {
    console.log('Duplicates found:', nameAgg.map((d) => `${d._id.name} (${d._id.city}): ${d.count} records`));
  }
  console.log('Districts count:', districts.length, 'Districts:', districts.filter(Boolean));
  console.log('Cities count:', cities.length);
  console.log('Regions:', regions.filter(Boolean));
  console.log('\nFacilities Breakdown:');
  console.table(facilityBreakdown);
  console.log('\nPlaces with verified genuine photos:', placesWithPhotos.length);
  console.log('Total reviews in DB:', totalReviews);
  console.log('Places with reviews in DB:', placesWithReviews);
  console.log('Reports in DB:', reportsCount);
  console.log('\nCoverage Stats Service Output:');
  console.log(JSON.stringify(coverageStats, null, 2));

  await mongoose.disconnect();
}

audit().catch(console.error);
