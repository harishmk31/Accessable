const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { getDbInfo } = require('./config/db');
const googlePlacesAdapter = require('./services/googlePlacesAdapter');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize MongoDB connection
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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

  res.status(200).json({
    status: 'ok',
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
      isConnected: readyState === 1,
      mode: dbInfo.mode || 'local',
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
      atlasNotice: dbInfo.atlasError || null
    },
    provider: providerStatus
  });
});

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/places', require('./routes/placeRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Server] AccessAble Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
