const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  toggleSavePlace,
  getSavedPlaces
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Bookmark / Saved Places
router.post('/save-place/:placeId', protect, toggleSavePlace);
router.get('/saved-places', protect, getSavedPlaces);

// Clean, unambiguous CommonJS export
module.exports = router;

