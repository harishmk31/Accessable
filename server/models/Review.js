const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: [true, 'Place ID is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    rating: {
      type: Number,
      required: [true, 'General rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars']
    },
    accessibilityRating: {
      type: Number,
      required: [true, 'Accessibility rating is required'],
      min: [1, 'Accessibility rating must be at least 1 star'],
      max: [5, 'Accessibility rating cannot exceed 5 stars']
    },
    comment: {
      type: String,
      required: [true, 'Review comment cannot be empty'],
      trim: true,
      minlength: [5, 'Review must be at least 5 characters long']
    },
    facilityFeedback: {
      wheelchairRamp: {
        type: String,
        enum: ['Available', 'Unavailable', 'Unknown', 'Not Checked'],
        default: 'Not Checked'
      },
      elevatorLift: {
        type: String,
        enum: ['Available', 'Unavailable', 'Unknown', 'Not Checked'],
        default: 'Not Checked'
      },
      accessibleToilet: {
        type: String,
        enum: ['Available', 'Unavailable', 'Unknown', 'Not Checked'],
        default: 'Not Checked'
      },
      accessibleParking: {
        type: String,
        enum: ['Available', 'Unavailable', 'Unknown', 'Not Checked'],
        default: 'Not Checked'
      },
      brailleSignage: {
        type: String,
        enum: ['Available', 'Unavailable', 'Unknown', 'Not Checked'],
        default: 'Not Checked'
      },
      audioAssistance: {
        type: String,
        enum: ['Available', 'Unavailable', 'Unknown', 'Not Checked'],
        default: 'Not Checked'
      }
    },
    isModerated: {
      type: Boolean,
      default: true // approved by default, admin can flag or unpublish
    }
  },
  {
    timestamps: true
  }
);

// Prevent user from submitting multiple reviews for the same place
reviewSchema.index({ place: 1, user: 1 }, { unique: true });

// Static method to recalculate average ratings on Place
reviewSchema.statics.calculateAverageRatings = async function (placeId) {
  const stats = await this.aggregate([
    {
      $match: { place: placeId, isModerated: true }
    },
    {
      $group: {
        _id: '$place',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        avgAccessibilityRating: { $avg: '$accessibilityRating' }
      }
    }
  ]);

  const Place = mongoose.model('Place');
  if (stats.length > 0) {
    await Place.findByIdAndUpdate(placeId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      averageAccessibilityRating: Math.round(stats[0].avgAccessibilityRating * 10) / 10,
      totalReviews: stats[0].nRating
    });
  } else {
    await Place.findByIdAndUpdate(placeId, {
      averageRating: 0,
      averageAccessibilityRating: 0,
      totalReviews: 0
    });
  }
};

// Recalculate after save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRatings(this.place);
});

// Recalculate after delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRatings(doc.place);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
