const express = require('express');
const router = express.Router();
const {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  verifyPlace,
  getPlaceStats
} = require('../controllers/placeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Specific stats route must be before /:id parameter route
router.get('/stats/overview', protect, adminOnly, getPlaceStats);

// Places collection
router.get('/', optionalAuth, getPlaces);
router.post('/', protect, createPlace);

// Specific place member routes
router.get('/:id', optionalAuth, getPlaceById);
router.put('/:id', protect, updatePlace);
router.delete('/:id', protect, deletePlace);

// Admin place moderation / verification
router.patch('/:id/verify', protect, adminOnly, verifyPlace);

module.exports = router;
