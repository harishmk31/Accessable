const express = require('express');
const router = express.Router();
const {
  getPlaces,
  getMapPlaces,
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
  getProviderStatus,
  getRegions,
  getCoverage,
  triggerIngest,
  checkDuplicate,
  uploadPlacePhoto,
  getAIAssessment,
  analyzePlaceImage,
  getDuplicatePlacesAdmin,
  getPhotoProxy
} = require('../controllers/placeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');

// 1. Static and aggregator endpoints (MUST come before /:id parameter)
router.get('/photo-proxy', getPhotoProxy);
router.get('/map', optionalAuth, getMapPlaces);
router.get('/nearby', getNearbyPlaces);
router.get('/search', searchPlaces);
router.get('/categories', getCategories);
router.get('/districts', getDistricts);
router.get('/regions', getRegions);
router.get('/coverage', getCoverage);
router.get('/provider/status', getProviderStatus);
router.post('/check-duplicate', checkDuplicate);
router.post('/upload-photo', protect, upload.single('photo'), uploadPlacePhoto);
router.post('/analyze-image', optionalAuth, upload.single('image'), analyzePlaceImage);
router.post('/ingest', protect, adminOnly, triggerIngest);
router.get('/stats/overview', protect, adminOnly, getPlaceStats);
router.get('/admin/reports', protect, adminOnly, getReportsAdmin);
router.patch('/admin/reports/:id', protect, adminOnly, updateReportStatus);
router.get('/admin/duplicates', protect, adminOnly, getDuplicatePlacesAdmin);

// 2. Collection root
router.get('/', optionalAuth, getPlaces);
router.post('/', protect, createPlace);

// 3. Place specific member routes
router.get('/:id', optionalAuth, getPlaceById);
router.get('/:id/accessibility', getPlaceAccessibility);
router.post('/:id/ai-assessment', optionalAuth, getAIAssessment);
router.post('/:id/reports', optionalAuth, submitPlaceReport);
router.put('/:id', protect, updatePlace);
router.delete('/:id', protect, deletePlace);

// 4. Admin place verification
router.patch('/:id/verify', protect, adminOnly, verifyPlace);
router.put('/:id/verify', protect, adminOnly, verifyPlace);

module.exports = router;
