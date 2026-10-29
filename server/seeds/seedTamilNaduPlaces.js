/**
 * AccessAble — Real Places Ingestion and Seeder
 * 
 * Ingests genuine places across Coimbatore and all regions of Tamil Nadu
 * using placeIngestionService.
 * 
 * Supports safe, repeatable execution without duplicates.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Place = require('../models/Place');
const User = require('../models/User');
const Review = require('../models/Review');
const TAMIL_NADU_VERIFIED_PLACES = require('../data/tamilNaduVerifiedDataset');
const placeIngestionService = require('../services/placeIngestionService');

dotenv.config({ path: __dirname + '/../.env' });

async function seedTamilNaduData() {
  try {
    console.log('[Seed Ingestion] Initializing database connection...');
    await connectDB();
    console.log('[Seed Ingestion] Database connection established.');

    // Ensure system admin user exists for attribution
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'AccessAble Administrator',
        email: 'admin@accessable.org',
        password: 'Admin@123',
        role: 'admin'
      });
      console.log('[Seed Ingestion] Created default admin account: admin@accessable.org');
    }

    // Ensure member test user exists
    let studentUser = await User.findOne({ email: 'student@accessable.org' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Kavitha S.',
        email: 'student@accessable.org',
        password: 'Student@123',
        role: 'user'
      });
      console.log('[Seed Ingestion] Created default member account: student@accessable.org');
    }

    console.log(`[Seed Ingestion] Processing ${TAMIL_NADU_VERIFIED_PLACES.length} verified Tamil Nadu locations...`);
    const stats = await placeIngestionService.ingestVerifiedCatalogue({ autoVerify: true });

    console.log(
      `[Seed Ingestion] Ingestion complete: ${stats.inserted} inserted, ${stats.updated} updated, ${stats.errors.length} errors.`
    );

    // Verify all places in database
    const totalCount = await Place.countDocuments({ status: 'verified' });
    const coverage = await placeIngestionService.getCoverageStats();

    console.log(`[Seed Ingestion] Total verified venues in database: ${totalCount}`);
    console.log(`[Seed Ingestion] Total districts covered: ${coverage.totalDistricts}`);
    console.log(`[Seed Ingestion] Regions represented: ${coverage.regions.map((r) => `${r._id} (${r.count})`).join(', ')}`);

    if (require.main === module) {
      await mongoose.connection.close();
      console.log('[Seed Ingestion] Database connection closed gracefully.');
      process.exit(0);
    }

    return stats;
  } catch (error) {
    console.error(`[Seed Ingestion Error] ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seedTamilNaduData();
}

module.exports = {
  TAMIL_NADU_PLACES: TAMIL_NADU_VERIFIED_PLACES,
  seedTamilNaduData
};
