const mongoose = require('mongoose');

const FACILITY_STATUS_ENUM = ['Available', 'Unavailable', 'Unknown'];

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      maxlength: [120, 'Place name cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Place description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Hospital',
          'College/University',
          'Restaurant/Cafe',
          'Office/Government',
          'Transit/Station',
          'Shopping/Mall',
          'Park/Recreation',
          'Other'
        ],
        message: '{VALUE} is not a valid category'
      }
    },
    address: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State / Province is required'],
      trim: true
    },
    postalCode: {
      type: String,
      default: '',
      trim: true
    },
    contactNumber: {
      type: String,
      default: '',
      trim: true
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        default: 0
      },
      lng: {
        type: Number,
        default: 0
      }
    },
    // Accessibility Facilities with 3-state logic: Available, Unavailable, Unknown
    facilities: {
      wheelchairRamp: {
        type: String,
        enum: FACILITY_STATUS_ENUM,
        default: 'Unknown'
      },
      elevatorLift: {
        type: String,
        enum: FACILITY_STATUS_ENUM,
        default: 'Unknown'
      },
      accessibleToilet: {
        type: String,
        enum: FACILITY_STATUS_ENUM,
        default: 'Unknown'
      },
      accessibleParking: {
        type: String,
        enum: FACILITY_STATUS_ENUM,
        default: 'Unknown'
      },
      brailleSignage: {
        type: String,
        enum: FACILITY_STATUS_ENUM,
        default: 'Unknown'
      },
      audioAssistance: {
        type: String,
        enum: FACILITY_STATUS_ENUM,
        default: 'Unknown'
      }
    },
    // Detailed notes explaining specifics of each facility
    facilityNotes: {
      wheelchairRamp: { type: String, default: '' },
      elevatorLift: { type: String, default: '' },
      accessibleToilet: { type: String, default: '' },
      accessibleParking: { type: String, default: '' },
      brailleSignage: { type: String, default: '' },
      audioAssistance: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'verified'
    },
    verificationNote: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    averageAccessibilityRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    images: [
      {
        type: String
      }
    ],
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    isSampleData: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Full text search index on name, description, city, address
placeSchema.index({
  name: 'text',
  description: 'text',
  city: 'text',
  state: 'text',
  address: 'text'
});

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
