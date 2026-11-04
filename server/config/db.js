const mongoose = require('mongoose');

let activeDbInfo = {
  mode: 'disconnected',
  status: 'disconnected',
  host: null,
  name: null,
  atlasError: null,
  error: null,
  fallbackActive: false
};

let connectingPromise = null;

/**
 * Categorize MongoDB Atlas connection failures for clear, actionable diagnostics.
 * Never leaks credentials, passwords, or secrets.
 */
function diagnoseMongoError(error) {
  const msg = (error && error.message) || '';
  const code = (error && error.code) || '';
  const lowerMsg = msg.toLowerCase();

  if (
    lowerMsg.includes('bad auth') ||
    lowerMsg.includes('authentication failed') ||
    code === 18 ||
    code === 8000
  ) {
    return {
      category: 'Authentication Failure',
      details: 'Authentication failed for the specified database user. Verify the username and password in MongoDB Atlas -> Database Access. If the password has special characters, ensure they are percent-encoded.',
      remediation: 'Check Atlas Dashboard -> Database Access. Confirm the user exists, password is correct, and user has readWrite permissions on accessable_db.'
    };
  }

  if (
    lowerMsg.includes('enotfound') ||
    lowerMsg.includes('querysrv') ||
    lowerMsg.includes('eai_again') ||
    lowerMsg.includes('getaddrinfo')
  ) {
    return {
      category: 'DNS / Invalid Hostname',
      details: `DNS lookup failed for the cluster hostname (${msg}). The cluster hostname in MONGODB_URI appears incorrect or unresolvable.`,
      remediation: 'Check Atlas Dashboard -> Cluster -> Connect -> Drivers. Copy the exact SRV connection string without modifying the cluster address.'
    };
  }

  if (
    lowerMsg.includes('whitelist') ||
    lowerMsg.includes('ip') ||
    lowerMsg.includes('could not connect to any servers in your mongodb atlas cluster')
  ) {
    return {
      category: 'IP Access-List / Network Restriction',
      details: 'Could not connect to any Atlas cluster nodes. Your current public IP address is likely not authorized in the Atlas Network Access allowlist.',
      remediation: 'Go to Atlas Dashboard -> Network Access -> Add IP Address -> Add Current IP Address (or 0.0.0.0/0 for development access).'
    };
  }

  if (
    lowerMsg.includes('timed out') ||
    lowerMsg.includes('timeout') ||
    lowerMsg.includes('econnrefused') ||
    (error && error.name === 'MongooseServerSelectionError')
  ) {
    return {
      category: 'Timeout / Connectivity Failure',
      details: `Server selection timed out (${msg}). The cluster may be paused, network firewall is blocking port 27017, or network connectivity is unstable.`,
      remediation: 'Verify your internet connection, ensure port 27017 is open, and check that the Atlas cluster is active (not paused).'
    };
  }

  return {
    category: 'General Connection Error',
    details: msg,
    remediation: 'Review connection string format, Atlas cluster status, and Mongoose connection options.'
  };
}

/**
 * Validate MongoDB connection string scheme.
 */
function validateMongoUri(uri) {
  if (!uri || typeof uri !== 'string') {
    return { isValid: false, reason: 'MONGODB_URI is not set or empty' };
  }
  const trimmed = uri.trim();
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) {
    return { isValid: false, reason: 'Invalid URI scheme: must start with mongodb:// or mongodb+srv://' };
  }
  return { isValid: true, uri: trimmed };
}

// Attach lifecycle listeners once to monitor ongoing connection health
let listenersAttached = false;
function setupLifecycleListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database Lifecycle] Mongoose disconnected from database');
    activeDbInfo.status = 'disconnected';
    activeDbInfo.mode = 'disconnected';
  });

  mongoose.connection.on('reconnected', () => {
    console.log(`[Database Lifecycle] Mongoose reconnected to ${mongoose.connection.host} / ${mongoose.connection.name}`);
    activeDbInfo.status = 'connected';
    activeDbInfo.host = mongoose.connection.host;
    activeDbInfo.name = mongoose.connection.name;
    activeDbInfo.mode = (activeDbInfo.host && !activeDbInfo.host.includes('127.0.0.1') && !activeDbInfo.host.includes('localhost')) ? 'cloud' : 'local';
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Lifecycle] Mongoose connection error: ${err.message}`);
    activeDbInfo.error = err.message;
  });
}

/**
 * Primary MongoDB connection initializer.
 * Connects to Atlas when configured. Does NOT silently fall back unless ALLOW_LOCAL_DB_FALLBACK=true is explicitly set.
 */
const connectDB = async () => {
  setupLifecycleListeners();

  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    activeDbInfo.status = 'connected';
    activeDbInfo.host = mongoose.connection.host;
    activeDbInfo.name = mongoose.connection.name;
    activeDbInfo.mode = (activeDbInfo.host && !activeDbInfo.host.includes('127.0.0.1') && !activeDbInfo.host.includes('localhost')) ? 'cloud' : 'local';
    return mongoose.connection;
  }

  // If already connecting, await the active promise
  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = (async () => {
    const configuredUri = process.env.MONGODB_URI;
    const allowFallback = process.env.ALLOW_LOCAL_DB_FALLBACK === 'true';
    const isProduction = process.env.NODE_ENV === 'production';
    const localUri = 'mongodb://127.0.0.1:27017/accessable_db';

    const validation = validateMongoUri(configuredUri);

    // 1. If configured URI is an Atlas / Remote cluster (starts with mongodb+srv:// or non-localhost)
    if (validation.isValid && !validation.uri.includes('127.0.0.1') && !validation.uri.includes('localhost')) {
      try {
        console.log('[Database] Connecting to configured MongoDB Atlas cluster...');
        activeDbInfo.status = 'connecting';
        const conn = await mongoose.connect(validation.uri, {
          serverSelectionTimeoutMS: 8000
        });
        activeDbInfo = {
          mode: 'cloud',
          status: 'connected',
          host: conn.connection.host,
          name: conn.connection.name,
          atlasError: null,
          error: null,
          fallbackActive: false
        };
        console.log(`[Database] Cloud MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
        return conn;
      } catch (error) {
        const diag = diagnoseMongoError(error);
        const sanitizedError = `${diag.category}: ${diag.details}`;
        activeDbInfo.atlasError = sanitizedError;
        activeDbInfo.error = sanitizedError;
        activeDbInfo.status = 'error';

        console.error('\n================================================================================');
        console.error('[Database Error] MongoDB Atlas Connection Failed!');
        console.error(`  Category:    ${diag.category}`);
        console.error(`  Details:     ${diag.details}`);
        console.error(`  Remediation: ${diag.remediation}`);
        console.error('================================================================================\n');

        if (isProduction) {
          console.error('[Database Fatal] Production mode does not allow local database fallback. Exiting process.');
          activeDbInfo.mode = 'disconnected';
          process.exit(1);
        }

        if (!allowFallback) {
          activeDbInfo.mode = 'disconnected';
          console.warn('[Database Notice] ALLOW_LOCAL_DB_FALLBACK is false. Startup will not silently redirect writes to local MongoDB.');
          console.warn('Set ALLOW_LOCAL_DB_FALLBACK=true in server/.env if you explicitly want local database fallback during development.\n');
          throw new Error(`MongoDB Atlas connection failed: [${diag.category}] ${diag.details}`);
        }

        console.warn('================================================================================');
        console.warn('[DATABASE WARNING] ALLOW_LOCAL_DB_FALLBACK=true is active.');
        console.warn('Falling back to local MongoDB service (127.0.0.1:27017/accessable_db).');
        console.warn('WARNING: ALL READS AND WRITES WILL GO TO LOCAL DATABASE, NOT ATLAS!');
        console.warn('================================================================================\n');
        activeDbInfo.fallbackActive = true;
      }
    }

    // 2. Connect to local MongoDB (either directly configured or explicit fallback opted in)
    const targetLocalUri = (validation.isValid && (validation.uri.includes('127.0.0.1') || validation.uri.includes('localhost')))
      ? validation.uri
      : localUri;

    try {
      activeDbInfo.status = 'connecting';
      const conn = await mongoose.connect(targetLocalUri, {
        serverSelectionTimeoutMS: 4000
      });
      activeDbInfo = {
        mode: 'local',
        status: 'connected',
        host: conn.connection.host,
        name: conn.connection.name,
        atlasError: activeDbInfo.atlasError,
        error: null,
        fallbackActive: activeDbInfo.fallbackActive || false
      };
      console.log(`[Database] Local MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`[Database Error] Local MongoDB connection also failed: ${error.message}`);
      activeDbInfo = {
        mode: 'disconnected',
        status: 'disconnected',
        host: null,
        name: null,
        atlasError: activeDbInfo.atlasError,
        error: `Local MongoDB connection failed: ${error.message}`,
        fallbackActive: false
      };
      if (isProduction) {
        process.exit(1);
      }
      throw error;
    }
  })();

  try {
    return await connectingPromise;
  } finally {
    connectingPromise = null;
  }
};

const getDbInfo = () => ({
  ...activeDbInfo,
  readyState: mongoose.connection.readyState
});

module.exports = connectDB;
module.exports.getDbInfo = getDbInfo;
module.exports.diagnoseMongoError = diagnoseMongoError;
module.exports.validateMongoUri = validateMongoUri;
