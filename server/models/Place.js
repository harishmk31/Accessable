const mongoose = require('mongoose');
const { getRegionForDistrict } = require('../services/geoService');

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
    title: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    },
    attribution: {
      type: String,
      default: 'AccessAble Contributor'
    },
    author: {
      type: String,
      default: ''
    },
    authorName: {
      type: String,
      default: ''
    },
    authorUrl: {
      type: String,
      default: ''
    },
    license: {
      type: String,
      default: 'CC BY-SA 4.0'
    },
    sourceUrl: {
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
    region: {
      type: String,
      enum: [
        'Western Tamil Nadu',
        'Northern Tamil Nadu',
        'Central Tamil Nadu',
        'Southern Tamil Nadu',
        'Other Destinations'
      ],
      default: 'Western Tamil Nadu',
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
    locationSource: {
      type: String,
      default: 'Survey of India / OpenStreetMap / Official Directory'
    },
    locationRetrievalDate: {
      type: Date,
      default: Date.now
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
    // Calculated 0-100 accessibility readiness score (null when insufficient evidence to produce a score)
    accessibilityScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100
    },
    // Transparent accessibility tier: High, Moderate, Limited, or Insufficient Data
    accessibilityTier: {
      type: String,
      enum: ['High Accessibility', 'Moderate Accessibility', 'Limited Accessibility', 'Insufficient Data'],
      default: 'Insufficient Data'
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
  // Auto-derive region from district if not explicitly provided or if default
  if (this.district && (!this.region || this.isModified('district'))) {
    this.region = getRegionForDistrict(this.district);
  }

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
    // 'User Reported Pending Verification', 'Conflicting Reports', and unverified default to 'Unknown'
    return 'Unknown';
  };

  const toDetailedStatus = (legacyStatus) => {
    if (legacyStatus === 'Available') return 'Verified Available';
    if (legacyStatus === 'Unavailable') return 'Verified Unavailable';
    return 'Unknown';
  };

  // If facilities was passed or modified, synchronize to accessibilityProfile
  if (this.facilities && (this.isNew || this.isModified('facilities'))) {
    if (!this.accessibilityProfile) this.accessibilityProfile = {};
    const f = this.facilities;
    const p = this.accessibilityProfile;

    const syncFacilityToProfile = (facVal, profKey, noteKey) => {
      if (facVal && facVal !== 'Unknown') {
        if (!p[profKey]) p[profKey] = {};
        if (!p[profKey].status || p[profKey].status === 'Unknown') {
          p[profKey].status = toDetailedStatus(facVal);
        }
        if (this.facilityNotes?.[noteKey] && !p[profKey].notes) {
          p[profKey].notes = this.facilityNotes[noteKey];
        }
      }
    };

    syncFacilityToProfile(f.wheelchairRamp, 'ramp', 'wheelchairRamp');
    syncFacilityToProfile(f.elevatorLift, 'lift', 'elevatorLift');
    syncFacilityToProfile(f.accessibleToilet, 'accessibleToilet', 'accessibleToilet');
    syncFacilityToProfile(f.accessibleParking, 'accessibleParking', 'accessibleParking');
    syncFacilityToProfile(f.brailleSignage, 'brailleSignage', 'brailleSignage');
    syncFacilityToProfile(f.audioAssistance, 'audioAssistance', 'audioAssistance');
  }

  // Synchronize accessibilityProfile back to legacy facilities
  if (this.accessibilityProfile) {
    const prof = this.accessibilityProfile;
    if (prof.ramp?.status) this.facilities.wheelchairRamp = toLegacyStatus(prof.ramp.status);
    if (prof.lift?.status) this.facilities.elevatorLift = toLegacyStatus(prof.lift.status);
    if (prof.accessibleToilet?.status) this.facilities.accessibleToilet = toLegacyStatus(prof.accessibleToilet.status);
    if (prof.accessibleParking?.status) this.facilities.accessibleParking = toLegacyStatus(prof.accessibleParking.status);
    if (prof.brailleSignage?.status) this.facilities.brailleSignage = toLegacyStatus(prof.brailleSignage.status);
    if (prof.audioAssistance?.status) this.facilities.audioAssistance = toLegacyStatus(prof.audioAssistance.status);

    if (prof.ramp?.notes) this.facilityNotes.wheelchairRamp = prof.ramp.notes;
    if (prof.lift?.notes) this.facilityNotes.elevatorLift = prof.lift.notes;
    if (prof.accessibleToilet?.notes) this.facilityNotes.accessibleToilet = prof.accessibleToilet.notes;
    if (prof.accessibleParking?.notes) this.facilityNotes.accessibleParking = prof.accessibleParking.notes;
    if (prof.brailleSignage?.notes) this.facilityNotes.brailleSignage = prof.brailleSignage.notes;
    if (prof.audioAssistance?.notes) this.facilityNotes.audioAssistance = prof.audioAssistance.notes;
  }

  // Calculate accessibilityScore and accessibilityTier
  // Unknown facilities are excluded from denominator (never assumed unavailable or penalized)
  const scoreResult = calculateAccessibilityScore(this.facilities);
  this.accessibilityScore = scoreResult.score;
  this.accessibilityTier = scoreResult.tier;

  next();
});

// Standalone scoring calculator function
function calculateAccessibilityScore(facilities) {
  const FACILITY_WEIGHTS = {
    wheelchairRamp: 25,
    elevatorLift: 20,
    accessibleToilet: 20,
    accessibleParking: 15,
    brailleSignage: 10,
    audioAssistance: 10
  };

  if (!facilities || typeof facilities !== 'object') {
    return {
      score: null,
      tier: 'Insufficient Data',
      auditedCount: 0,
      earnedScore: 0,
      assessedMaxWeight: 0
    };
  }

  let earnedScore = 0;
  let assessedMaxWeight = 0;
  let auditedCount = 0;

  for (const [key, weight] of Object.entries(FACILITY_WEIGHTS)) {
    const rawVal = facilities[key];
    const val = typeof rawVal === 'string' ? rawVal.trim() : '';
    if (val === 'Available') {
      earnedScore += weight;
      assessedMaxWeight += weight;
      auditedCount++;
    } else if (val === 'Unavailable') {
      assessedMaxWeight += weight;
      auditedCount++;
    }
  }

  if (auditedCount < 2 || assessedMaxWeight === 0) {
    return {
      score: null,
      tier: 'Insufficient Data',
      auditedCount,
      earnedScore,
      assessedMaxWeight
    };
  }

  const normalizedScore = Math.round((earnedScore / assessedMaxWeight) * 100);
  let tier = 'Limited Accessibility';
  if (normalizedScore >= 70) {
    tier = 'High Accessibility';
  } else if (normalizedScore >= 40) {
    tier = 'Moderate Accessibility';
  }

  return {
    score: normalizedScore,
    tier,
    auditedCount,
    earnedScore,
    assessedMaxWeight
  };
}

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
placeSchema.index({ region: 1, district: 1 });
placeSchema.index({ status: 1 });

const Place = mongoose.model('Place', placeSchema);
Place.calculateAccessibilityScore = calculateAccessibilityScore;
module.exports = Place;
