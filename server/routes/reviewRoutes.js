const express = require('express');
const router = express.Router();
const {
  getPlaceReviews,
  getRecentReviews,
  addReview,
  deleteReview,
  getAllReviewsAdmin,
  toggleModerateReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Recent community reviews
router.get('/recent', getRecentReviews);

// Place reviews
router.get('/place/:placeId', getPlaceReviews);
router.post('/place/:placeId', protect, addReview);

// Delete review (author or admin)
router.delete('/:id', protect, deleteReview);

// Admin review moderation
router.get('/admin/all', protect, adminOnly, getAllReviewsAdmin);
router.patch('/:id/moderate', protect, adminOnly, toggleModerateReview);

module.exports = router;
