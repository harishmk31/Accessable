const Review = require('../models/Review');
const Place = require('../models/Place');

// @desc    Get reviews for a place
// @route   GET /api/reviews/place/:placeId
// @access  Public
const getPlaceReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      place: req.params.placeId,
      isModerated: true
    })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a review for a place
// @route   POST /api/reviews/place/:placeId
// @access  Private (Authenticated users)
const addReview = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const { rating, accessibilityRating, comment, facilityFeedback } = req.body;

    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    if (!rating || !accessibilityRating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, accessibility rating, and review comments'
      });
    }

    // Check if user already reviewed this place
    const existingReview = await Review.findOne({
      place: placeId,
      user: req.user._id
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = Number(rating);
      existingReview.accessibilityRating = Number(accessibilityRating);
      existingReview.comment = comment.trim();
      if (facilityFeedback) {
        existingReview.facilityFeedback = facilityFeedback;
      }
      await existingReview.save();

      const populatedReview = await Review.findById(existingReview._id).populate(
        'user',
        'name role'
      );

      return res.json({
        success: true,
        message: 'Your review was updated successfully',
        data: populatedReview
      });
    }

    const review = await Review.create({
      place: placeId,
      user: req.user._id,
      rating: Number(rating),
      accessibilityRating: Number(accessibilityRating),
      comment: comment.trim(),
      facilityFeedback: facilityFeedback || {}
    });

    const populatedReview = await Review.findById(review._id).populate(
      'user',
      'name role'
    );

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      data: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review author or Admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const isAuthor = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(review._id);

    res.json({
      success: true,
      message: 'Review removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for administration moderation
// @route   GET /api/reviews/admin/all
// @access  Private (Admin only)
const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email role')
      .populate('place', 'name category city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle review moderation status (approve/hide)
// @route   PATCH /api/reviews/:id/moderate
// @access  Private (Admin only)
const toggleModerateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isModerated = !review.isModerated;
    await review.save();

    res.json({
      success: true,
      message: `Review is now ${review.isModerated ? 'approved' : 'hidden'}`,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlaceReviews,
  addReview,
  deleteReview,
  getAllReviewsAdmin,
  toggleModerateReview
};
