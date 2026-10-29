const express = require('express');
const router = express.Router();
const {
  getPlaces,
  getNearbyPlaces,
  searchPlaces,
  getCategories,
  getDistricts,
  getPlaceById,
  getPlaceAccessibility,
  createPlace,
  updatePlace,
  deletePlace,
  verifyPlace,
  submitPlaceReport,
  getReportsAdmin,
  updateReportStatus,
  getPlaceStats,
  getProviderStatus
} = require('../controllers/placeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// 1. Static and aggregator endpoints (MUST come before /:id parameter)
router.get('/nearby', getNearbyPlaces);
router.get('/search', searchPlaces);
router.get('/categories', getCategories);
router.get('/districts', getDistricts);
router.get('/provider/status', getProviderStatus);
router.get('/stats/overview', protect, adminOnly, getPlaceStats);
router.get('/admin/reports', protect, adminOnly, getReportsAdmin);
router.patch('/admin/reports/:id', protect, adminOnly, updateReportStatus);

// 2. Collection root
router.get('/', optionalAuth, getPlaces);
router.post('/', protect, createPlace);

// 3. Place specific member routes
router.get('/:id', optionalAuth, getPlaceById);
router.get('/:id/accessibility', getPlaceAccessibility);
router.post('/:id/reports', optionalAuth, submitPlaceReport);
router.put('/:id', protect, updatePlace);
router.delete('/:id', protect, deletePlace);

// 4. Admin place verification
router.patch('/:id/verify', protect, adminOnly, verifyPlace);

module.exports = router;
