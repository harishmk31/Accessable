const path = require('path');
const fs = require('fs');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Report = require('../models/Report');
const googlePlacesAdapter = require('../services/googlePlacesAdapter');
const placeIngestionService = require('../services/placeIngestionService');
const { calculateDistanceKm, REGIONAL_CENTERS } = require('../services/geoService');
const { generateAIAssessment, calculateAccessibilityMetrics } = require('../services/aiAssessmentService');
const { analyzeImageWithVision } = require('../services/visionAnalysisService');

const VALID_FACILITY_VALUES = ['Available', 'Unavailable', 'Unknown'];

// Helper to escape regex special characters in user input
const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to normalize facility query params (handles both 'Available' and boolean 'true')
const normalizeFacilityQueryValue = (val) => {
  if (!val) return null;
  const s = String(val).toLowerCase().trim();
  if (s === 'true' || s === '1' || s === 'yes' || s === 'available') return 'Available';
  if (s === 'false' || s === '0' || s === 'no' || s === 'unavailable') return 'Unavailable';
  if (s === 'unknown') return 'Unknown';
  return null;
};

// Helper to sanitize legacy facility inputs
const sanitizeFacilities = (rawFacilities = {}) => {
  const result = {};
  const facilityKeys = [
    'wheelchairRamp',
    'elevatorLift',
    'accessibleToilet',
    'accessibleParking',
    'brailleSignage',
    'audioAssistance'
  ];

  facilityKeys.forEach((key) => {
    const val = rawFacilities[key];
    if (VALID_FACILITY_VALUES.includes(val)) {
      result[key] = val;
    } else {
      result[key] = 'Unknown';
    }
  });

  return result;
};

// @desc    Get all places with advanced search, district/locality filter, distance & pagination
// @route   GET /api/places
// @access  Public
const getPlaces = async (req, res, next) => {
  try {
    const {
      q,
      category,
      region,
      district,
      locality,
      city,
      wheelchairRamp,
      elevatorLift,
      accessibleToilet,
      accessibleParking,
      brailleSignage,
      audioAssistance,
      minRating,
      minAccessibilityRating,
      minAccessibilityScore,
      accessibilityTier,
      status,
      sortBy,
      lat,
      lng,
      radius, // in kilometers
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    // Verification status filter
    if (req.user && req.user.role === 'admin' && status) {
      if (status !== 'all') {
        filter.status = status;
      }
    } else {
      filter.status = 'verified';
    }

    // Region filter
    if (region && region !== 'All') {
      filter.region = { $regex: new RegExp(`^${escapeRegex(region)}$`, 'i') };
    }

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // District filter
    if (district && district !== 'All') {
      filter.district = { $regex: new RegExp(`^${escapeRegex(district)}$`, 'i') };
    }

    // Locality filter
    if (locality && locality !== 'All') {
      filter.locality = { $regex: new RegExp(`^${escapeRegex(locality)}$`, 'i') };
    }

    // City filter
    if (city && city !== 'All') {
      filter.city = { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') };
    }

    // Keyword search across text fields
    if (q && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
        { locality: searchRegex },
        { city: searchRegex },
        { district: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Individual accessibility facility filters
    const facilityFilters = {
      wheelchairRamp,
      elevatorLift,
      accessibleToilet,
      accessibleParking,
      brailleSignage,
      audioAssistance
    };

    Object.entries(facilityFilters).forEach(([key, value]) => {
      const normalized = normalizeFacilityQueryValue(value);
      if (normalized) {
        filter[`facilities.${key}`] = normalized;
      }
    });

    // Rating and Score filters
    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }
    if (minAccessibilityRating) {
      filter.averageAccessibilityRating = { $gte: Number(minAccessibilityRating) };
    }
    if (minAccessibilityScore) {
      filter.accessibilityScore = { $gte: Number(minAccessibilityScore) };
    }
    if (accessibilityTier && accessibilityTier !== 'All') {
      filter.accessibilityTier = accessibilityTier;
    }

    // Geospatial filter using MongoDB $geoWithin if lat/lng/radius provided
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    const radiusKm = radius ? parseFloat(radius) : null;

    if (userLat && userLng && radiusKm) {
      // radius in radians: radius in km / 6371
      filter.location = {
        $geoWithin: {
          $centerSphere: [[userLng, userLat], radiusKm / 6371]
        }
      };
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (sortBy === 'rating_desc') {
      sort = { averageRating: -1, totalReviews: -1 };
    } else if (sortBy === 'accessibility_desc') {
      sort = { averageAccessibilityRating: -1, totalReviews: -1 };
    } else if (sortBy === 'score_desc') {
      sort = { accessibilityScore: -1, averageAccessibilityRating: -1 };
    } else if (sortBy === 'name_asc') {
      sort = { name: 1 };
    } else if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch places
    let [total, rawPlaces] = await Promise.all([
      Place.countDocuments(filter),
      Place.find(filter)
        .populate('createdBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
    ]);

    let fallbackNotice = null;
    // If strict geo radius filter returned 0 places, relax radius to show closest Tamil Nadu places
    if (total === 0 && filter.location) {
      const relaxedFilter = { ...filter };
      delete relaxedFilter.location;
      const [fallbackTotal, fallbackRaw] = await Promise.all([
        Place.countDocuments(relaxedFilter),
        Place.find(relaxedFilter)
          .populate('createdBy', 'name email role')
          .sort(sort)
          .limit(limitNum)
      ]);
      if (fallbackTotal > 0) {
        total = fallbackTotal;
        rawPlaces = fallbackRaw;
        fallbackNotice = `No venues found within ${radiusKm}km of coordinates. Showing closest verified places in Tamil Nadu.`;
      }
    }

    // Attach calculated distance if user coordinates provided
    let places = rawPlaces.map((doc) => {
      const obj = doc.toObject();
      if (userLat && userLng && obj.coordinates?.lat && obj.coordinates?.lng) {
        obj.distanceKm = calculateDistanceKm(
          userLat,
          userLng,
          obj.coordinates.lat,
          obj.coordinates.lng
        );
      }
      return obj;
    });

    // If sorting by distance
    if (sortBy === 'distance' && userLat && userLng) {
      places.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
    }

    res.json({
      success: true,
      count: places.length,
      fallbackNotice,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      },
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby places using geospatial query
// @route   GET /api/places/nearby
// @access  Public
const getNearbyPlaces = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radius = 25,
      category,
      q,
      wheelchairRamp,
      elevatorLift,
      accessibleToilet,
      accessibleParking,
      brailleSignage,
      audioAssistance,
      minAccessibilityScore,
      limit = 24
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude coordinates are required for nearby discovery.'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = Math.min(100, Math.max(0.5, parseFloat(radius)));

    const filter = {
      status: 'verified',
      location: {
        $geoWithin: {
          $centerSphere: [[userLng, userLat], radiusKm / 6371]
        }
      }
    };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
        { locality: searchRegex },
        { city: searchRegex },
        { district: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Individual accessibility facility filters
    const facilityFilters = {
      wheelchairRamp,
      elevatorLift,
      accessibleToilet,
      accessibleParking,
      brailleSignage,
      audioAssistance
    };

    Object.entries(facilityFilters).forEach(([key, value]) => {
      const normalized = normalizeFacilityQueryValue(value);
      if (normalized) {
        filter[`facilities.${key}`] = normalized;
      }
    });

    if (minAccessibilityScore) {
      filter.accessibilityScore = { $gte: Number(minAccessibilityScore) };
    }

    let places = await Place.find(filter)
      .limit(parseInt(limit, 10))
      .populate('createdBy', 'name email role');

    let fallbackNotice = null;
    if (places.length === 0) {
      // Relax radius boundary if 0 places matched nearby
      const relaxedFilter = { ...filter };
      delete relaxedFilter.location;
      places = await Place.find(relaxedFilter)
        .limit(parseInt(limit, 10))
        .populate('createdBy', 'name email role');
      if (places.length > 0) {
        fallbackNotice = `No venues found within ${radiusKm}km of your coordinates. Displaying verified venues across Tamil Nadu with distance calculated from your location.`;
      }
    }

    // Attach distance and sort nearest first
    const withDistance = places
      .map((p) => {
        const obj = p.toObject();
        obj.distanceKm = calculateDistanceKm(
          userLat,
          userLng,
          obj.coordinates?.lat || obj.location?.coordinates?.[1],
          obj.coordinates?.lng || obj.location?.coordinates?.[0]
        );
        return obj;
      })
      .sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));

    res.json({
      success: true,
      count: withDistance.length,
      center: { lat: userLat, lng: userLng },
      radiusKm,
      fallbackNotice,
      pagination: {
        total: withDistance.length,
        page: 1,
        pages: 1,
        limit: parseInt(limit, 10)
      },
      data: withDistance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fast search places across Tamil Nadu
// @route   GET /api/places/search
// @access  Public
const searchPlaces = async (req, res, next) => {
  try {
    const { q = '', limit = 10 } = req.query;

    if (!q.trim()) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const regex = new RegExp(escapeRegex(q.trim()), 'i');
    const places = await Place.find({
      status: 'verified',
      $or: [
        { name: regex },
        { locality: regex },
        { city: regex },
        { district: regex },
        { address: regex },
        { tags: regex }
      ]
    })
      .select('name category locality city district coordinates averageRating averageAccessibilityRating facilities photos images')
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct categories with venue counts
// @route   GET /api/places/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const stats = await Place.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: stats.map((s) => ({ category: s._id, count: s.count }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get covered districts and localities in Tamil Nadu
// @route   GET /api/places/districts
// @access  Public
const getDistricts = async (req, res, next) => {
  try {
    const districts = await Place.aggregate([
      { $match: { status: 'verified' } },
      {
        $group: {
          _id: '$district',
          count: { $sum: 1 },
          localities: { $addToSet: '$locality' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: districts.map((d) => ({
        district: d._id,
        count: d.count,
        localities: d.localities.filter(Boolean)
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Tamil Nadu regions and their district breakdowns
// @route   GET /api/places/regions
// @access  Public
const getRegions = async (req, res, next) => {
  try {
    const regions = await Place.aggregate([
      { $match: { status: 'verified' } },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          districts: { $addToSet: '$district' },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formatted = regions.map((r) => ({
      region: r._id || 'Western Tamil Nadu',
      count: r.count,
      totalPlaces: r.count,
      districts: r.districts.filter(Boolean),
      categories: r.categories.filter(Boolean)
    }));

    res.json({
      success: true,
      data: formatted,
      regions: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real statewide coverage statistics
// @route   GET /api/places/coverage
// @access  Public
const getCoverage = async (req, res, next) => {
  try {
    const stats = await placeIngestionService.getCoverageStats();
    res.json({
      success: true,
      data: stats,
      ...stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin endpoint to trigger or refresh data ingestion
// @route   POST /api/places/ingest
// @access  Private/Admin
const triggerIngest = async (req, res, next) => {
  try {
    const { mode = 'catalogue', city, category } = req.body;
    let result;

    if (mode === 'city' && city) {
      result = await placeIngestionService.ingestByCityOrDistrict(city);
    } else if (mode === 'category' && category) {
      result = await placeIngestionService.ingestByCategory(category);
    } else {
      result = await placeIngestionService.ingestVerifiedCatalogue();
    }

    const coverage = await placeIngestionService.getCoverageStats();

    res.json({
      success: true,
      message: 'Ingestion pipeline executed successfully',
      result,
      coverage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single place by ID
// @route   GET /api/places/:id
// @access  Public
const getPlaceById = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id).populate(
      'createdBy',
      'name email role'
    );

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    // Exclude pending places from public view (only the submitter or an admin can access)
    if (place.status !== 'verified') {
      const isOwner =
        req.user &&
        place.createdBy &&
        (req.user._id || req.user.id || '').toString() ===
          (place.createdBy._id || place.createdBy).toString();
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: 'This venue listing is currently awaiting administrative review and is not publicly available.'
        });
      }
    }

    // Also fetch reviews for this place
    const reviews = await Review.find({ place: place._id, isModerated: true })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: place,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get structured accessibility audit for a place
// @route   GET /api/places/:id/accessibility
// @access  Public
const getPlaceAccessibility = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id).select(
      'name category address city district accessibilityProfile facilities facilityNotes lastVerifiedAt verificationSource verificationNote'
    );

    if (!place) {
      return res.status(404).json({ success: false, message: 'Place not found' });
    }

    res.json({
      success: true,
      data: {
        placeId: place._id,
        name: place.name,
        category: place.category,
        address: `${place.address}, ${place.city}, ${place.district}`,
        accessibilityProfile: place.accessibilityProfile,
        facilities: place.facilities,
        facilityNotes: place.facilityNotes,
        lastVerifiedAt: place.lastVerifiedAt,
        verificationSource: place.verificationSource,
        verificationNote: place.verificationNote
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new place
// @route   POST /api/places
// @access  Private (Authenticated users)
const createPlace = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      address,
      locality,
      city,
      district,
      state = 'Tamil Nadu',
      postalCode,
      contactNumber,
      website,
      coordinates,
      facilities,
      facilityNotes,
      accessibilityProfile,
      tags,
      images,
      photos
    } = req.body;

    const placeDistrict = district ? district.trim() : (city ? city.trim() : 'Coimbatore');

    if (!name || !description || !category || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, category, address, and city'
      });
    }

    const sanitizedFacilities = sanitizeFacilities(facilities);
    // Newly registered places require administrator verification before public display
    const initialStatus = req.user && req.user.role === 'admin' ? 'verified' : 'pending';

    const lat = coordinates?.lat !== undefined ? Number(coordinates.lat) : 11.0168;
    const lng = coordinates?.lng !== undefined ? Number(coordinates.lng) : 76.9558;

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided. Latitude must be between -90 and 90, Longitude between -180 and 180.'
      });
    }

    // Duplicate place validation: check if a venue with the same name and city already exists
    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingDuplicate = await Place.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
      city: { $regex: new RegExp(`^${escapedCity}$`, 'i') }
    });

    if (existingDuplicate) {
      return res.status(409).json({
        success: false,
        message: `A venue named "${existingDuplicate.name}" already exists in ${existingDuplicate.city}. Duplicate entries are prevented to preserve data integrity.`,
        duplicateId: existingDuplicate._id
      });
    }

    const place = await Place.create({
      name: name.trim(),
      description: description.trim(),
      category,
      address: address.trim(),
      locality: locality ? locality.trim() : '',
      city: city.trim(),
      district: placeDistrict,
      state: state.trim(),
      postalCode: postalCode ? postalCode.trim() : '',
      contactNumber: contactNumber ? contactNumber.trim() : '',
      website: website ? website.trim() : '',
      coordinates: { lat, lng },
      location: { type: 'Point', coordinates: [lng, lat] },
      facilities: sanitizedFacilities,
      facilityNotes: facilityNotes || {},
      accessibilityProfile: accessibilityProfile || {},
      tags: Array.isArray(tags) ? tags : [],
      images: Array.isArray(images) && images.length > 0 ? images : [],
      photos: Array.isArray(photos) ? photos : [],
      status: initialStatus,
      createdBy: req.user._id,
      verificationSource: 'Community Submission'
    });

    res.status(201).json({
      success: true,
      message: 'Place listed successfully',
      data: place
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a place listing
// @route   PUT /api/places/:id
// @access  Private (Creator or Admin)
const updatePlace = async (req, res, next) => {
  try {
    let place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    const isOwner = place.createdBy && place.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this listing'
      });
    }

    const {
      name,
      description,
      category,
      address,
      locality,
      city,
      district,
      state,
      postalCode,
      contactNumber,
      website,
      coordinates,
      facilities,
      facilityNotes,
      accessibilityProfile,
      tags,
      images,
      photos,
      status,
      verificationNote
    } = req.body;

    if (name) place.name = name.trim();
    if (description) place.description = description.trim();
    if (category) place.category = category;
    if (address) place.address = address.trim();
    if (locality !== undefined) place.locality = locality.trim();
    if (city) place.city = city.trim();
    if (district) place.district = district.trim();
    if (state) place.state = state.trim();
    if (postalCode !== undefined) place.postalCode = postalCode.trim();
    if (contactNumber !== undefined) place.contactNumber = contactNumber.trim();
    if (website !== undefined) place.website = website.trim();
    if (tags) place.tags = Array.isArray(tags) ? tags : place.tags;
    if (images) place.images = Array.isArray(images) ? images : place.images;
    if (photos) place.photos = Array.isArray(photos) ? photos : place.photos;

    if (coordinates && coordinates.lat && coordinates.lng) {
      place.coordinates = coordinates;
      place.location = {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      };
    }

    if (facilities) {
      place.facilities = sanitizeFacilities({
        ...place.facilities.toObject(),
        ...facilities
      });
    }

    if (facilityNotes) {
      place.facilityNotes = {
        ...place.facilityNotes,
        ...facilityNotes
      };
    }

    if (accessibilityProfile) {
      place.accessibilityProfile = {
        ...place.accessibilityProfile.toObject(),
        ...accessibilityProfile
      };
    }

    if (isAdmin && status) {
      place.status = status;
      if (verificationNote !== undefined) {
        place.verificationNote = verificationNote;
      }
    }

    await place.save();

    res.json({
      success: true,
      message: 'Place updated successfully',
      data: place
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a place listing
// @route   DELETE /api/places/:id
// @access  Private (Creator or Admin)
const deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    const isOwner = place.createdBy && place.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this place'
      });
    }

    await Review.deleteMany({ place: place._id });
    await Report.deleteMany({ place: place._id });
    await Place.findByIdAndDelete(place._id);

    res.json({
      success: true,
      message: 'Place, associated reviews, and reports deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or moderate a place listing (Admin action)
// @route   PATCH /api/places/:id/verify
// @access  Private (Admin only)
const verifyPlace = async (req, res, next) => {
  try {
    const { status, verificationNote } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending', 'verified', or 'rejected'"
      });
    }

    const place = await Place.findByIdAndUpdate(
      req.params.id,
      {
        status,
        verificationNote: verificationNote || '',
        lastVerifiedAt: new Date()
      },
      { new: true }
    );

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    res.json({
      success: true,
      message: `Place status updated to ${status}`,
      data: place
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit report about inaccurate information
// @route   POST /api/places/:id/reports
// @access  Public / Authenticated
const submitPlaceReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { issueCategory, description, evidence, reporterName, reporterEmail } = req.body;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({ success: false, message: 'Place not found' });
    }

    if (!issueCategory || !description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an issue category and at least 10 characters explaining the inaccuracy.'
      });
    }

    const report = await Report.create({
      place: id,
      user: req.user ? req.user._id : null,
      reporterName: reporterName ? reporterName.trim() : (req.user ? req.user.name : 'Anonymous Contributor'),
      reporterEmail: reporterEmail ? reporterEmail.trim() : (req.user ? req.user.email : ''),
      issueCategory,
      description: description.trim(),
      evidence: evidence ? evidence.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reporting this inaccuracy. Our moderation team will investigate and update the audit.',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (Admin only)
// @route   GET /api/places/admin/reports
// @access  Private (Admin only)
const getReportsAdmin = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('place', 'name address locality city district')
      .populate('user', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status (Admin only)
// @route   PATCH /api/places/admin/reports/:id
// @access  Private (Admin only)
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes.trim();
    report.reviewedBy = req.user._id;

    if (status === 'resolved' || status === 'dismissed') {
      report.resolvedAt = new Date();
    }

    await report.save();

    res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics & accessibility statistics (Admin)
// @route   GET /api/places/stats/overview
// @access  Private (Admin only)
const getPlaceStats = async (req, res, next) => {
  try {
    const totalPlaces = await Place.countDocuments();
    const verifiedPlaces = await Place.countDocuments({ status: 'verified' });
    const pendingPlaces = await Place.countDocuments({ status: 'pending' });
    const rejectedPlaces = await Place.countDocuments({ status: 'rejected' });
    const totalReviews = await Review.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Facility breakdown among verified places
    const facilityCounts = {
      wheelchairRamp: await Place.countDocuments({
        status: 'verified',
        'facilities.wheelchairRamp': 'Available'
      }),
      elevatorLift: await Place.countDocuments({
        status: 'verified',
        'facilities.elevatorLift': 'Available'
      }),
      accessibleToilet: await Place.countDocuments({
        status: 'verified',
        'facilities.accessibleToilet': 'Available'
      }),
      accessibleParking: await Place.countDocuments({
        status: 'verified',
        'facilities.accessibleParking': 'Available'
      }),
      brailleSignage: await Place.countDocuments({
        status: 'verified',
        'facilities.brailleSignage': 'Available'
      }),
      audioAssistance: await Place.countDocuments({
        status: 'verified',
        'facilities.audioAssistance': 'Available'
      })
    };

    const FAC_AUDIT_KEYS = ['wheelchairRamp', 'elevatorLift', 'accessibleToilet', 'accessibleParking', 'brailleSignage', 'audioAssistance'];
    const facilityAuditBreakdown = {};
    for (const fac of FAC_AUDIT_KEYS) {
      facilityAuditBreakdown[fac] = {
        confirmedAvailable: await Place.countDocuments({ status: 'verified', [`facilities.${fac}`]: 'Available' }),
        confirmedUnavailable: await Place.countDocuments({ status: 'verified', [`facilities.${fac}`]: 'Unavailable' }),
        unknownNotAssessed: await Place.countDocuments({ status: 'verified', [`facilities.${fac}`]: { $nin: ['Available', 'Unavailable'] } })
      };
    }

    // Category distribution
    const categoryStats = await Place.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // District distribution
    const districtStats = await Place.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Evidentiary Data Quality Metrics computed from actual database records
    const verifiedDocs = await Place.find({ status: 'verified' })
      .select('coordinates location photos images facilities accessibilityTier isSampleData')
      .lean();

    let placesWithCoordinates = 0;
    let placesWithPhotos = 0;
    let placesWithAtLeastOneAssessedFacility = 0;
    let placesFullyAssessed = 0;
    let placesInsufficientData = 0;
    let suspiciousOrInvalidRecords = 0;

    const FAC_KEYS = ['wheelchairRamp', 'elevatorLift', 'accessibleToilet', 'accessibleParking', 'brailleSignage', 'audioAssistance'];

    verifiedDocs.forEach((p) => {
      const lat = p.coordinates?.lat ?? p.location?.coordinates?.[1];
      const lng = p.coordinates?.lng ?? p.location?.coordinates?.[0];
      const isTN = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) && lat >= 8.0 && lat <= 13.6 && lng >= 76.0 && lng <= 80.6;
      if (isTN) {
        placesWithCoordinates++;
      } else {
        suspiciousOrInvalidRecords++;
      }

      const photoUrl = p.photos?.[0]?.url || p.images?.[0] || '';
      if (photoUrl && !photoUrl.includes('images.unsplash.com')) {
        placesWithPhotos++;
      }

      let assessedCount = 0;
      const f = p.facilities || {};
      FAC_KEYS.forEach((k) => {
        if (f[k] === 'Available' || f[k] === 'Unavailable') assessedCount++;
      });

      if (assessedCount >= 1) placesWithAtLeastOneAssessedFacility++;
      if (assessedCount === 6) placesFullyAssessed++;
      if (assessedCount < 2 || p.accessibilityTier === 'Insufficient Data') placesInsufficientData++;
    });

    const dataQuality = {
      totalEligiblePlaces: verifiedPlaces,
      placesWithCoordinates,
      placesWithPhotos,
      placesWithAtLeastOneAssessedFacility,
      placesFullyAssessed,
      placesInsufficientData,
      placesAwaitingReview: pendingPlaces,
      suspiciousOrInvalidRecords
    };

    res.json({
      success: true,
      stats: {
        totalPlaces,
        verifiedPlaces,
        pendingPlaces,
        rejectedPlaces,
        totalReviews,
        pendingReports,
        facilityCounts,
        facilityAuditBreakdown,
        categoryStats,
        districtStats,
        dataQuality
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Google Places Provider Status
// @route   GET /api/places/provider/status
// @access  Public
const getProviderStatus = async (req, res) => {
  res.json({
    success: true,
    data: googlePlacesAdapter.getStatus()
  });
};

// @desc    Check if a place with name & city already exists (Pre-submit duplicate prevention)
// @route   POST /api/places/check-duplicate
// @access  Public / Authenticated
const checkDuplicate = async (req, res, next) => {
  try {
    const { name, city } = req.body;
    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name and city are required to perform duplicate check.'
      });
    }

    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const existing = await Place.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
      city: { $regex: new RegExp(`^${escapedCity}$`, 'i') }
    }).select('name city address district category status accessibilityScore');

    if (existing) {
      return res.json({
        success: true,
        isDuplicate: true,
        existingPlace: existing,
        message: `A venue named "${existing.name}" already exists in ${existing.city}.`
      });
    }

    res.json({
      success: true,
      isDuplicate: false,
      message: 'No duplicate found. Name is available.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload authentic place photograph
// @route   POST /api/places/upload-photo
// @access  Private
const uploadPlacePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload.'
      });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;
    const host = req.get('host');
    const protocol = req.protocol;
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    res.status(201).json({
      success: true,
      message: 'Place photograph uploaded successfully.',
      data: {
        filename: req.file.filename,
        url: relativeUrl,
        fullUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
        caption: req.body.caption || '',
        attribution: req.body.attribution || (req.user ? req.user.name : 'AccessAble Contributor')
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate comprehensive AI Accessibility Assessment
// @route   POST /api/places/:id/ai-assessment
// @access  Public / Authenticated
const getAIAssessment = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    const reviews = await Review.find({ place: place._id, isModerated: true })
      .select('rating accessibilityRating comment createdAt')
      .limit(10);

    const assessment = await generateAIAssessment(place, reviews);

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze uploaded or remote image for accessibility features using computer vision
// @route   POST /api/places/analyze-image
// @access  Public / Authenticated
const analyzePlaceImage = async (req, res, next) => {
  let tempFilePath = null;
  try {
    let filePath = null;
    let base64Data = null;
    let mimeType = null;
    let originalName =
      (req.file ? req.file.originalname : null) ||
      req.body.fileName ||
      (req.body.imageUrl ? path.basename(req.body.imageUrl) : 'image.jpg');

    if (req.file) {
      filePath = req.file.path;
      tempFilePath = req.file.path;
      mimeType = req.file.mimetype;
    } else if (req.body.imageUrl) {
      const imgUrl = req.body.imageUrl;
      if (imgUrl.startsWith('/uploads/')) {
        filePath = path.join(__dirname, '..', imgUrl);
      } else {
        // Validate external image URL: restrict to upload.wikimedia.org to prevent SSRF
        try {
          const parsed = new URL(imgUrl);
          if (parsed.protocol !== 'https:' || parsed.hostname !== 'upload.wikimedia.org') {
            return res.status(400).json({
              success: false,
              message: 'Invalid image URL. Only local uploads and upload.wikimedia.org are supported.'
            });
          }
        } catch (e) {
          return res.status(400).json({ success: false, message: 'Malformed image URL.' });
        }
      }
    } else if (req.body.imageBase64) {
      const base64Str = req.body.imageBase64;
      if (base64Str.length > 7 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Image base64 payload exceeds 5MB limit.' });
      }
      base64Data = base64Str.replace(/^data:image\/\w+;base64,/, '');
      mimeType = req.body.mimeType || 'image/jpeg';
    } else if (!req.body.fileName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file, image URL, or base64 data to analyze.'
      });
    }

    const venueContext = {
      name: req.body.placeName,
      category: req.body.placeCategory
    };

    const analysis = await analyzeImageWithVision({
      filePath,
      base64Data,
      mimeType,
      originalName,
      venueContext
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  } finally {
    // Clean up temporary upload file if one was written
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        // silent cleanup
      }
    }
  }
};

// @desc    Scan for potential duplicate places across the dataset (Admin)
// @route   GET /api/places/admin/duplicates
// @access  Private (Admin only)
const getDuplicatePlacesAdmin = async (req, res, next) => {
  try {
    const duplicates = await Place.aggregate([
      {
        $group: {
          _id: { name: { $toLower: '$name' }, city: { $toLower: '$city' } },
          count: { $sum: 1 },
          ids: { $push: '$_id' },
          places: {
            $push: {
              _id: '$_id',
              name: '$name',
              category: '$category',
              address: '$address',
              city: '$city',
              district: '$district',
              status: '$status',
              createdAt: '$createdAt'
            }
          }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      count: duplicates.length,
      data: duplicates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Secure image proxy for Wikimedia Commons to prevent 403 hotlink blocks in browser
// @route   GET /api/places/photo-proxy
// @access  Public
const getPhotoProxy = (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).json({ success: false, message: 'Image URL query parameter is required.' });
  }

  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'upload.wikimedia.org') {
      return res.status(400).json({ success: false, message: 'Invalid image URL or untrusted host. Only upload.wikimedia.org is allowed.' });
    }
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Malformed image URL.' });
  }

  const https = require('https');
  const clientReq = https.get(
    imageUrl,
    {
      headers: {
        'User-Agent': 'AccessAbleApp/1.0 (https://accessable.college.edu; contact@accessable.edu)'
      },
      timeout: 8000
    },
    (upstreamRes) => {
      if (upstreamRes.statusCode !== 200) {
        return res.status(upstreamRes.statusCode).end();
      }

      const contentType = upstreamRes.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
      upstreamRes.pipe(res);
    }
  );

  clientReq.on('error', () => {
    res.status(502).end();
  });

  clientReq.on('timeout', () => {
    clientReq.destroy();
    res.status(504).end();
  });
};

// @desc    Get lightweight places data specifically for the interactive map
// @route   GET /api/places/map
// @access  Public
const getMapPlaces = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user && req.user.role === 'admin' && req.query.status) {
      if (req.query.status !== 'all') filter.status = req.query.status;
    } else {
      filter.status = 'verified';
    }

    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    if (req.query.q) {
      const qEscaped = escapeRegex(req.query.q);
      filter.$or = [
        { name: { $regex: qEscaped, $options: 'i' } },
        { address: { $regex: qEscaped, $options: 'i' } },
        { city: { $regex: qEscaped, $options: 'i' } },
        { district: { $regex: qEscaped, $options: 'i' } }
      ];
    }

    ['wheelchairRamp', 'elevatorLift', 'accessibleToilet', 'accessibleParking', 'brailleSignage', 'audioAssistance'].forEach((fac) => {
      const val = normalizeFacilityQueryValue(req.query[fac]);
      if (val) {
        filter[`facilities.${fac}`] = val;
      }
    });

    const totalPlaces = await Place.countDocuments(filter);

    // Fetch places that have location coordinates
    const places = await Place.find({
      ...filter,
      'location.coordinates': { $exists: true, $type: 'array', $ne: [] }
    })
      .select('_id name category address locality city district location coordinates accessibilityScore accessibilityTier facilities isSampleData')
      .lean();

    const validPlaces = places.filter((p) => {
      const coords = p.coordinates || (p.location && p.location.coordinates ? { lng: p.location.coordinates[0], lat: p.location.coordinates[1] } : null);
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number' || isNaN(coords.lat) || isNaN(coords.lng)) {
        return false;
      }
      // Validate Tamil Nadu geographic coordinates bounds: Lat 8.0 to 13.6, Lng 76.0 to 80.6
      // Records outside this bounding box (e.g. demonstration personas) are excluded from the Tamil Nadu map
      return coords.lat >= 8.0 && coords.lat <= 13.6 && coords.lng >= 76.0 && coords.lng <= 80.6;
    });

    res.status(200).json({
      success: true,
      count: validPlaces.length,
      totalPlaces,
      coverageNotice: `${validPlaces.length} of ${totalPlaces} eligible places have map locations in Tamil Nadu`,
      data: validPlaces
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
