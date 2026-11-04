/**
 * AccessAble — Local to MongoDB Atlas Data Migration Script
 * 
 * Safely migrates verified collections from local MongoDB (accessable_db) to MongoDB Atlas.
 * - Dry run by default (queries and displays source and destination counts without writing).
 * - Requires explicit --confirm flag to execute writes.
 * - Verifies destination collections are completely empty before inserting.
 * - Preserves original _id values and all document fields bit-for-bit.
 * - Copies secondary indexes (2dsphere, unique, text).
 * - Never prints secrets or credentials.
 * 
 * Usage:
 *   Dry Run:   node server/scripts/migrateLocalToAtlas.js
 *   Execute:   node server/scripts/migrateLocalToAtlas.js --confirm
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from server/.env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const COLLECTIONS = ['places', 'reports', 'reviews', 'users'];
const BATCH_SIZE = 50;

/**
 * Mask password and secrets in MongoDB URI for safe console reporting.
 */
function maskUri(uri) {
  if (!uri || typeof uri !== 'string') return '[empty]';
  return uri.replace(
    /^(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)$/,
    '$1********$3'
  );
}

/**
 * Format a key-value tabular report.
 */
function logSection(title) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

async function run() {
  const isConfirmed = process.argv.includes('--confirm');
  const localUri = 'mongodb://127.0.0.1:27017/accessable_db';
  const atlasUri = process.env.MONGODB_URI;

  logSection(isConfirmed ? 'ACCESSABLE MIGRATION: EXECUTION MODE (--confirm)' : 'ACCESSABLE MIGRATION: DRY RUN MODE');

  if (!atlasUri) {
    console.error('[Error] MONGODB_URI is not set in server/.env');
    process.exit(1);
  }

  if (atlasUri.includes('127.0.0.1') || atlasUri.includes('localhost')) {
    console.error('[Error] MONGODB_URI in server/.env points to a local database, not MongoDB Atlas.');
    console.error('Please configure your MongoDB Atlas connection string in server/.env before migrating.');
    process.exit(1);
  }

  console.log(`[Config] Source:      ${localUri}`);
  console.log(`[Config] Destination: ${maskUri(atlasUri)}`);
  console.log(`[Config] Mode:        ${isConfirmed ? 'LIVE EXECUTION' : 'DRY RUN (no writes will be performed)'}`);

  console.log('\n[Connection] Connecting to source and destination databases...');
  let localConn;
  let atlasConn;

  try {
    localConn = await mongoose.createConnection(localUri, {
      serverSelectionTimeoutMS: 5000
    }).asPromise();
    console.log(`[Connection] Source Connected:      ${localConn.host} / ${localConn.name}`);

    atlasConn = await mongoose.createConnection(atlasUri, {
      serverSelectionTimeoutMS: 10000
    }).asPromise();
    console.log(`[Connection] Destination Connected: ${atlasConn.host} / ${atlasConn.name}`);
  } catch (connErr) {
    console.error(`[Connection Error] Failed to connect to databases: ${connErr.message}`);
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    process.exit(1);
  }

  // 1. Audit current counts in both databases
  logSection('DOCUMENT COUNT AUDIT');
  const audit = {};
  let totalSourceDocs = 0;
  let totalDestDocs = 0;

  for (const collName of COLLECTIONS) {
    const sourceCount = await localConn.collection(collName).countDocuments();
    const destCount = await atlasConn.collection(collName).countDocuments();
    audit[collName] = { source: sourceCount, dest: destCount };
    totalSourceDocs += sourceCount;
    totalDestDocs += destCount;

    console.log(
      `  Collection "${collName.padEnd(8)}": Source = ${String(sourceCount).padStart(4)} docs  |  Atlas = ${String(destCount).padStart(4)} docs`
    );
  }

  console.log('-'.repeat(70));
  console.log(`  Total Documents:          Source = ${String(totalSourceDocs).padStart(4)} docs  |  Atlas = ${String(totalDestDocs).padStart(4)} docs`);

  // 2. Dry run handling
  if (!isConfirmed) {
    logSection('DRY RUN SUMMARY');
    console.log('✓ Source and destination connections verified successfully.');
    console.log(`✓ Source database has ${totalSourceDocs} total records across ${COLLECTIONS.length} collections.`);
    console.log(`✓ Destination database on Atlas currently has ${totalDestDocs} records.`);

    if (totalDestDocs === 0) {
      console.log('✓ Atlas destination is completely empty and ready for initial migration.');
    } else {
      console.warn('! Destination collections already contain documents. Review before executing.');
    }

    console.log('\nNO WRITES WERE PERFORMED (Dry Run completed safely).');
    console.log('\nTo execute the migration and copy documents to Atlas, run:');
    console.log('  node server/scripts/migrateLocalToAtlas.js --confirm\n');

    await localConn.close();
    await atlasConn.close();
    process.exit(0);
  }

  // 3. Execution Safety Guard: Destination collections MUST be empty
  logSection('PRE-MIGRATION SAFETY CHECK');
  for (const collName of COLLECTIONS) {
    if (audit[collName].dest > 0) {
      console.error(
        `\n[SAFETY HALT] Destination collection "${collName}" already contains ${audit[collName].dest} documents.`
      );
      console.error('Migration aborted to prevent overwriting, duplicating, or conflicting records on MongoDB Atlas.');
      console.error('If you intend to re-migrate, manually inspect or clear the Atlas database first.\n');
      await localConn.close();
      await atlasConn.close();
      process.exit(1);
    }
  }
  console.log('✓ Verified: All 4 destination collections on MongoDB Atlas are completely empty.');

  // 4. Perform Data Migration Collection-by-Collection
  logSection('MIGRATING COLLECTIONS TO MONGODB ATLAS');
  const migrationResults = {};

  for (const collName of COLLECTIONS) {
    const sourceCount = audit[collName].source;
    console.log(`\n--> Migrating collection "${collName}" (${sourceCount} documents)...`);

    if (sourceCount === 0) {
      console.log(`    Collection "${collName}" is empty in source; skipping documents.`);
      migrationResults[collName] = { migrated: 0, verified: true };
      continue;
    }

    // Read all raw documents from source collection preserving all BSON types and _id
    const docs = await localConn.collection(collName).find({}).toArray();

    // Insert in batches with ordered: true to guarantee insertion sequence
    let insertedTotal = 0;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      await atlasConn.collection(collName).insertMany(batch, { ordered: true });
      insertedTotal += batch.length;
      console.log(`    Inserted ${insertedTotal} / ${sourceCount} documents into Atlas...`);
    }

    // Copy secondary indexes (excluding default _id_)
    try {
      const sourceIndexes = await localConn.collection(collName).indexes();
      const secondaryIndexes = sourceIndexes
        .filter((idx) => idx.name !== '_id_')
        .map((idx) => {
          const { v, ns, ...indexSpec } = idx;
          return indexSpec;
        });

      if (secondaryIndexes.length > 0) {
        console.log(`    Copying ${secondaryIndexes.length} secondary index(es) for "${collName}"...`);
        for (const idx of secondaryIndexes) {
          const { key, name, unique, sparse, expireAfterSeconds, weights, default_language } = idx;
          const options = { name };
          if (unique) options.unique = unique;
          if (sparse) options.sparse = sparse;
          if (expireAfterSeconds !== undefined) options.expireAfterSeconds = expireAfterSeconds;
          if (weights) options.weights = weights;
          if (default_language) options.default_language = default_language;

          await atlasConn.collection(collName).createIndex(key, options);
          console.log(`      ✓ Index "${name}" created.`);
        }
      }
    } catch (idxErr) {
      console.warn(`    [Index Warning] Non-fatal index creation warning on "${collName}": ${idxErr.message}`);
    }

    migrationResults[collName] = { migrated: insertedTotal };
  }

  // 5. Post-Migration Verification
  logSection('POST-MIGRATION VERIFICATION');
  let allMatched = true;

  for (const collName of COLLECTIONS) {
    const finalSourceCount = await localConn.collection(collName).countDocuments();
    const finalDestCount = await atlasConn.collection(collName).countDocuments();
    const isMatch = finalSourceCount === finalDestCount;

    if (!isMatch) allMatched = false;

    console.log(
      `  Collection "${collName.padEnd(8)}": Source = ${String(finalSourceCount).padStart(4)}  |  Atlas = ${String(finalDestCount).padStart(4)}  |  Status: ${isMatch ? '✓ VERIFIED MATCH' : '✗ MISMATCH'}`
    );
  }

  console.log('-'.repeat(70));

  if (allMatched) {
    console.log('\n🎉 SUCCESS: All 4 collections migrated and verified with 100% document count parity!');
    console.log('MongoDB Atlas (accessable_db) is now fully synchronized with local data.\n');
  } else {
    console.error('\n⚠️ WARNING: One or more collections have document count discrepancies.');
    console.error('Please review the table above.\n');
  }

  await localConn.close();
  await atlasConn.close();
  console.log('[Connection] Database connections closed gracefully.');
}

run().catch((err) => {
  console.error('\n[Fatal Error during migration]', err);
  process.exit(1);
});
