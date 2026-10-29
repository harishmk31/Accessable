const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: [true, 'Place ID is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reporterName: {
      type: String,
      trim: true,
      default: 'Anonymous Contributor'
    },
    reporterEmail: {
      type: String,
      trim: true,
      default: ''
    },
    issueCategory: {
      type: String,
      required: [true, 'Issue category is required'],
      enum: {
        values: [
          'incorrect_accessibility',
          'closed_permanently',
          'wrong_address',
          'wrong_contact_or_hours',
          'inappropriate_content',
          'other'
        ],
        message: '{VALUE} is not a valid report category'
      }
    },
    description: {
      type: String,
      required: [true, 'Please provide details of the inaccuracy'],
      trim: true,
      minlength: [10, 'Report description must be at least 10 characters']
    },
    evidence: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ place: 1, status: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
