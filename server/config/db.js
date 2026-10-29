const mongoose = require('mongoose');

let activeDbInfo = {
  mode: 'disconnected',
  host: null,
  name: null,
  atlasError: null
};

const connectDB = async () => {
  const configuredUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/accessable_db';

  // 1. Try configured MONGODB_URI if provided and not explicitly localhost
  if (configuredUri && !configuredUri.includes('127.0.0.1') && !configuredUri.includes('localhost')) {
    try {
      console.log('[Database] Connecting to configured MongoDB cluster...');
      const conn = await mongoose.connect(configuredUri, {
        serverSelectionTimeoutMS: 5000
      });
      activeDbInfo = {
        mode: 'cloud',
        host: conn.connection.host,
        name: conn.connection.name,
        atlasError: null
      };
      console.log(`[Database] Cloud MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.warn(`[Database Warning] Cloud MongoDB connection failed: ${error.message}`);
      activeDbInfo.atlasError = error.message;
      console.log('[Database] Falling back to local MongoDB service...');
    }
  }

  // 2. Connect to local MongoDB
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 4000
    });
    activeDbInfo = {
      mode: 'local',
      host: conn.connection.host,
      name: conn.connection.name,
      atlasError: activeDbInfo.atlasError
    };
    console.log(`[Database] Local MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Local MongoDB connection also failed: ${error.message}`);
    activeDbInfo = {
      mode: 'disconnected',
      host: null,
      name: null,
      atlasError: activeDbInfo.atlasError || error.message
    };
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

const getDbInfo = () => ({
  ...activeDbInfo,
  readyState: mongoose.connection.readyState
});

module.exports = connectDB;
module.exports.getDbInfo = getDbInfo;
