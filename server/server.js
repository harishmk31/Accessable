// Load environment variables before any module or database initialization
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { getDbInfo } = require('./config/db');
const googlePlacesAdapter = require('./services/googlePlacesAdapter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for authentic uploaded place photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Ensure database is connected before processing data requests (essential for serverless runtimes like Vercel)
app.use(async (req, res, next) => {
  if (req.path === '/api/health') {
    return next();
  }
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Gentle rate limiting for public queries
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again in a few minutes.'
  }
});
app.use('/api', apiLimiter);

// Health check endpoint with database connection inspection & provider status
app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbStatus = stateMap[readyState] || 'unknown';
  const dbInfo = getDbInfo ? getDbInfo() : {};
  const providerStatus = googlePlacesAdapter.getStatus();

  const isConnected = readyState === 1;
  const isCloud = isConnected && dbInfo.mode === 'cloud';
  const effectiveMode = isConnected ? (isCloud ? 'cloud' : 'local') : 'disconnected';
  const statusCode = isConnected ? 200 : 503;

  res.status(statusCode).json({
    status: isConnected ? 'ok' : 'degraded',
    service: 'AccessAble API',
    api: {
      status: 'online',
      service: 'AccessAble API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    },
    database: {
      status: dbStatus,
      readyState: readyState,
      isConnected: isConnected,
      mode: effectiveMode,
      host: isConnected ? (mongoose.connection.host || null) : null,
      name: isConnected ? (mongoose.connection.name || null) : null,
      atlasNotice: dbInfo.atlasError || dbInfo.error || null,
      fallbackActive: Boolean(dbInfo.fallbackActive)
    },
    provider: providerStatus
  });
});

/**
 * Safely resolves an Express router or middleware function across:
 * 1. Standard CommonJS function/router: module.exports = fn / router
 * 2. Transpiled ES Modules: { default: fn / router, __esModule: true }
 * 3. Named exports: { router: fn } or { errorHandler: fn }
 *
 * Prevents "TypeError: Router.use() requires a middleware function but got a Object"
 * on serverless and bundled runtimes like Vercel.
 */
function resolveMiddleware(mod, name) {
  if (typeof mod === 'function') {
    return mod;
  }
  if (mod && typeof mod.default === 'function') {
    return mod.default;
  }
  if (mod && typeof mod.router === 'function') {
    return mod.router;
  }
  if (mod && typeof mod.errorHandler === 'function') {
    return mod.errorHandler;
  }
  if (name && mod && typeof mod[name] === 'function') {
    return mod[name];
  }
  throw new TypeError(
    `[Server Router] Registration failed for ${name || 'middleware'}: expected a function or Express Router, but got ${typeof mod} (${Object.prototype.toString.call(mod)})`
  );
}

// Defensively resolve routers and error handler across CJS and ESM bundling boundaries
const authRoutes = resolveMiddleware(require('./routes/authRoutes'), 'authRoutes');
const placeRoutes = resolveMiddleware(require('./routes/placeRoutes'), 'placeRoutes');
const reviewRoutes = resolveMiddleware(require('./routes/reviewRoutes'), 'reviewRoutes');
const resolvedErrorHandler = resolveMiddleware(errorHandler, 'errorHandler');

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(resolvedErrorHandler);

const PORT = process.env.PORT || 5000;

// Deterministic startup sequencing: database connection is awaited before accepting requests
async function startServer() {
  try {
    console.log('[Server] Initializing database connection before starting HTTP listener...');
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[Server] AccessAble Server running on http://localhost:${PORT}`);
    });
    return server;
  } catch (error) {
    console.error(`\n[Server Fatal] Startup halted due to database connection failure: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

// Serverless runtime exports (supports CommonJS require, ES Module import, and named export)
module.exports = app;
module.exports.default = app;
module.exports.app = app;
module.exports.startServer = startServer;
module.exports.resolveMiddleware = resolveMiddleware;
