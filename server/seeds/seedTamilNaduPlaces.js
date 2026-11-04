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

function extractDatabaseName(uri) {
  if (!uri || typeof uri !== 'string') return '';
  const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//i, '');
  const withoutAuth = withoutProtocol.includes('@') ? withoutProtocol.split('@')[1] : withoutProtocol;
  const pathPart = withoutAuth.split('?')[0].split('/')[1] || '';
  return pathPart.trim();
}

async function seedTamilNaduData() {
  const targetDbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accessable_db';
  const targetDbName = extractDatabaseName(targetDbUri);
  const isTestDb = targetDbName.toLowerCase().includes('test');
  const hasConfirmFlag = process.argv.includes('--confirm-production');

  if (!isTestDb && !hasConfirmFlag) {
    console.error(`\n[ABORTED] Refusing to run seed script against non-test database "${targetDbName}".`);
    console.error(`Pass '--confirm-production' to execute intentionally.\n`);
    process.exit(1);
  }

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
