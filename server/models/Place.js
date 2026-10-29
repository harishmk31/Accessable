const mongoose = require('mongoose');

const LEGACY_FACILITY_ENUM = ['Available', 'Unavailable', 'Unknown'];

const ACCESSIBILITY_STATUS_ENUM = [
  'Verified Available',
  'Verified Unavailable',
  'Unknown',
  'Conflicting Reports',
  'User Reported Pending Verification'
];

const featureSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ACCESSIBILITY_STATUS_ENUM,
      default: 'Unknown'
    },
    evidenceSource: {
      type: String,
      default: 'Not audited yet'
    },
    sourceUrl: {
      type: String,
      default: ''
    },
    verificationMethod: {
      type: String,
      enum: ['on_site_audit', 'official_venue_data', 'provider_metadata', 'community_report', 'unverified'],
      default: 'unverified'
    },
    lastVerifiedAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const photoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    attribution: {
      type: String,
      default: 'AccessAble Contributor'
    },
    authorName: {
      type: String,
      default: ''
    },
    authorUrl: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      maxlength: [150, 'Place name cannot exceed 150 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
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
          // Standard / legacy categories
          'Hospital',
          'College/University',
          'Restaurant/Cafe',
          'Office/Government',
          'Transit/Station',
          'Shopping/Mall',
          'Park/Recreation',
          'Parks & Gardens',
          'Other',
          // Real-world Tamil Nadu expanded categories
          'Tourist Attractions & Monuments',
          'Temples & Cultural Venues',
          'Beaches & Waterfronts',
          'Hotels & Accommodation',
          'Libraries & Community Facilities',
          'Public Restrooms & Facilities'
        ],
        message: '{VALUE} is not a valid category'
      }
    },
    address: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    locality: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    district: {
      type: String,
      default: 'Coimbatore',
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      default: 'Tamil Nadu',
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
    // GeoJSON Point location for 2dsphere spatial indexing
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [76.9558, 11.0168] // Coimbatore default
      }
    },
    // Legacy coordinates object { lat, lng } kept in sync
    coordinates: {
      lat: {
        type: Number,
        default: 11.0168
      },
      lng: {
        type: Number,
        default: 76.9558
      }
    },
    // Data provider provenance
    provider: {
      type: String,
      enum: ['accessable_verified', 'google_places', 'osm', 'community_audit'],
      default: 'accessable_verified'
    },
    providerPlaceId: {
      type: String,
      sparse: true,
      index: true
    },
    // Photos with attribution
    photos: [photoSchema],
    // Backward-compatible images array of URLs
    images: [
      {
        type: String
      }
    ],
    openingHours: {
      weekdayDescriptions: [{ type: String }],
      isOpenNow: { type: Boolean, default: null }
    },
    // Comprehensive Multi-Domain Accessibility Profile
    accessibilityProfile: {
      // Wheelchair Accessibility
      stepFreeEntrance: { type: featureSchema, default: () => ({}) },
      ramp: { type: featureSchema, default: () => ({}) },
      lift: { type: featureSchema, default: () => ({}) },
      accessibleRoute: { type: featureSchema, default: () => ({}) },
      accessibleParking: { type: featureSchema, default: () => ({}) },
      accessibleToilet: { type: featureSchema, default: () => ({}) },
      doorwayWidthAdequate: { type: featureSchema, default: () => ({}) },
      seatingRestArea: { type: featureSchema, default: () => ({}) },

      // Visual Accessibility
      brailleSignage: { type: featureSchema, default: () => ({}) },
      tactilePaving: { type: featureSchema, default: () => ({}) },
      audioAssistance: { type: featureSchema, default: () => ({}) },
      highContrastSignage: { type: featureSchema, default: () => ({}) },
      guidedAssistance: { type: featureSchema, default: () => ({}) },

      // Hearing Accessibility
      visualAnnouncements: { type: featureSchema, default: () => ({}) },
      hearingLoop: { type: featureSchema, default: () => ({}) },
      captionedFacilities: { type: featureSchema, default: () => ({}) },
      communicationSupport: { type: featureSchema, default: () => ({}) },

      // Other Considerations
      clearWayfinding: { type: featureSchema, default: () => ({}) },
      quietSpace: { type: featureSchema, default: () => ({}) },
      trainedStaff: { type: featureSchema, default: () => ({}) },
      accessibleBooking: { type: featureSchema, default: () => ({}) }
    },
    // Legacy 6-facility map for 100% backward compatibility
    facilities: {
      wheelchairRamp: {
        type: String,
        enum: LEGACY_FACILITY_ENUM,
        default: 'Unknown'
      },
      elevatorLift: {
        type: String,
        enum: LEGACY_FACILITY_ENUM,
        default: 'Unknown'
      },
      accessibleToilet: {
        type: String,
        enum: LEGACY_FACILITY_ENUM,
        default: 'Unknown'
      },
      accessibleParking: {
        type: String,
        enum: LEGACY_FACILITY_ENUM,
        default: 'Unknown'
      },
      brailleSignage: {
        type: String,
        enum: LEGACY_FACILITY_ENUM,
        default: 'Unknown'
      },
      audioAssistance: {
        type: String,
        enum: LEGACY_FACILITY_ENUM,
        default: 'Unknown'
      }
    },
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
    verificationSource: {
      type: String,
      default: 'AccessAble Field Audit'
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now
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

// Synchronize coordinates and legacy facilities before saving
placeSchema.pre('save', function (next) {
  // Sync slug
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Sync GeoJSON location and legacy coordinates
  if (this.coordinates && (this.coordinates.lat || this.coordinates.lng)) {
    this.location = {
      type: 'Point',
      coordinates: [this.coordinates.lng, this.coordinates.lat]
    };
  } else if (this.location && this.location.coordinates && this.location.coordinates.length === 2) {
    this.coordinates = {
      lat: this.location.coordinates[1],
      lng: this.location.coordinates[0]
    };
  }

  // Sync images array with photos array
  if (this.photos && this.photos.length > 0 && (!this.images || this.images.length === 0)) {
    this.images = this.photos.map((p) => p.url);
  } else if (this.images && this.images.length > 0 && (!this.photos || this.photos.length === 0)) {
    this.photos = this.images.map((url) => ({
      url,
      caption: this.name,
      attribution: 'AccessAble Contributor'
    }));
  }

  // Bidirectional sync between legacy facilities and detailed accessibilityProfile
  const toLegacyStatus = (detailedStatus) => {
    if (detailedStatus === 'Verified Available') return 'Available';
    if (detailedStatus === 'Verified Unavailable') return 'Unavailable';
    return 'Unknown';
  };

  const toDetailedStatus = (legacyStatus) => {
    if (legacyStatus === 'Available') return 'Verified Available';
    if (legacyStatus === 'Unavailable') return 'Verified Unavailable';
    return 'Unknown';
  };

  // If facilities passed with Available/Unavailable, ensure accessibilityProfile matches
  if (this.facilities) {
    if (!this.accessibilityProfile) this.accessibilityProfile = {};
    const f = this.facilities;
    const p = this.accessibilityProfile;

    if (f.wheelchairRamp && f.wheelchairRamp !== 'Unknown' && (!p.ramp?.status || p.ramp?.status === 'Unknown')) {
      if (!p.ramp) p.ramp = {};
      p.ramp.status = toDetailedStatus(f.wheelchairRamp);
      if (this.facilityNotes?.wheelchairRamp) p.ramp.notes = this.facilityNotes.wheelchairRamp;
    }
    if (f.elevatorLift && f.elevatorLift !== 'Unknown' && (!p.lift?.status || p.lift?.status === 'Unknown')) {
      if (!p.lift) p.lift = {};
      p.lift.status = toDetailedStatus(f.elevatorLift);
      if (this.facilityNotes?.elevatorLift) p.lift.notes = this.facilityNotes.elevatorLift;
    }
    if (f.accessibleToilet && f.accessibleToilet !== 'Unknown' && (!p.accessibleToilet?.status || p.accessibleToilet?.status === 'Unknown')) {
      if (!p.accessibleToilet) p.accessibleToilet = {};
      p.accessibleToilet.status = toDetailedStatus(f.accessibleToilet);
      if (this.facilityNotes?.accessibleToilet) p.accessibleToilet.notes = this.facilityNotes.accessibleToilet;
    }
    if (f.accessibleParking && f.accessibleParking !== 'Unknown' && (!p.accessibleParking?.status || p.accessibleParking?.status === 'Unknown')) {
      if (!p.accessibleParking) p.accessibleParking = {};
      p.accessibleParking.status = toDetailedStatus(f.accessibleParking);
      if (this.facilityNotes?.accessibleParking) p.accessibleParking.notes = this.facilityNotes.accessibleParking;
    }
    if (f.brailleSignage && f.brailleSignage !== 'Unknown' && (!p.brailleSignage?.status || p.brailleSignage?.status === 'Unknown')) {
      if (!p.brailleSignage) p.brailleSignage = {};
      p.brailleSignage.status = toDetailedStatus(f.brailleSignage);
      if (this.facilityNotes?.brailleSignage) p.brailleSignage.notes = this.facilityNotes.brailleSignage;
    }
    if (f.audioAssistance && f.audioAssistance !== 'Unknown' && (!p.audioAssistance?.status || p.audioAssistance?.status === 'Unknown')) {
      if (!p.audioAssistance) p.audioAssistance = {};
      p.audioAssistance.status = toDetailedStatus(f.audioAssistance);
      if (this.facilityNotes?.audioAssistance) p.audioAssistance.notes = this.facilityNotes.audioAssistance;
    }
  }

  // And sync accessibilityProfile back to legacy facilities
  if (this.accessibilityProfile) {
    const prof = this.accessibilityProfile;
    if (prof.ramp?.status && prof.ramp.status !== 'Unknown') this.facilities.wheelchairRamp = toLegacyStatus(prof.ramp.status);
    if (prof.lift?.status && prof.lift.status !== 'Unknown') this.facilities.elevatorLift = toLegacyStatus(prof.lift.status);
    if (prof.accessibleToilet?.status && prof.accessibleToilet.status !== 'Unknown') this.facilities.accessibleToilet = toLegacyStatus(prof.accessibleToilet.status);
    if (prof.accessibleParking?.status && prof.accessibleParking.status !== 'Unknown') this.facilities.accessibleParking = toLegacyStatus(prof.accessibleParking.status);
    if (prof.brailleSignage?.status && prof.brailleSignage.status !== 'Unknown') this.facilities.brailleSignage = toLegacyStatus(prof.brailleSignage.status);
    if (prof.audioAssistance?.status && prof.audioAssistance.status !== 'Unknown') this.facilities.audioAssistance = toLegacyStatus(prof.audioAssistance.status);

    if (prof.ramp?.notes) this.facilityNotes.wheelchairRamp = prof.ramp.notes;
    if (prof.lift?.notes) this.facilityNotes.elevatorLift = prof.lift.notes;
    if (prof.accessibleToilet?.notes) this.facilityNotes.accessibleToilet = prof.accessibleToilet.notes;
    if (prof.accessibleParking?.notes) this.facilityNotes.accessibleParking = prof.accessibleParking.notes;
    if (prof.brailleSignage?.notes) this.facilityNotes.brailleSignage = prof.brailleSignage.notes;
    if (prof.audioAssistance?.notes) this.facilityNotes.audioAssistance = prof.audioAssistance.notes;
  }

  next();
});

// Geospatial 2dsphere index for location queries
placeSchema.index({ location: '2dsphere' });

// Full text search index
placeSchema.index({
  name: 'text',
  description: 'text',
  city: 'text',
  district: 'text',
  locality: 'text',
  address: 'text',
  tags: 'text'
});

placeSchema.index({ district: 1, locality: 1, category: 1 });
placeSchema.index({ status: 1 });

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
