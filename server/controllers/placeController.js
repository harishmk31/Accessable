const Place = require('../models/Place');
const Review = require('../models/Review');
const Report = require('../models/Report');
const googlePlacesAdapter = require('../services/googlePlacesAdapter');
const { calculateDistanceKm, REGIONAL_CENTERS } = require('../services/geoService');

const VALID_FACILITY_VALUES = ['Available', 'Unavailable', 'Unknown'];

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

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // District filter
    if (district && district !== 'All') {
      filter.district = { $regex: new RegExp(`^${district}$`, 'i') };
    }

    // Locality filter
    if (locality && locality !== 'All') {
      filter.locality = { $regex: new RegExp(`^${locality}$`, 'i') };
    }

    // City filter
    if (city && city !== 'All') {
      filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    // Keyword search across text fields
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
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
      if (value && VALID_FACILITY_VALUES.includes(value)) {
        filter[`facilities.${key}`] = value;
      }
    });

    // Rating filters
    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }
    if (minAccessibilityRating) {
      filter.averageAccessibilityRating = { $gte: Number(minAccessibilityRating) };
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
    } else if (sortBy === 'name_asc') {
      sort = { name: 1 };
    } else if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch places
    const [total, rawPlaces] = await Promise.all([
      Place.countDocuments(filter),
      Place.find(filter)
        .populate('createdBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
    ]);

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
    const { lat, lng, radius = 25, category, limit = 20 } = req.query;

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

    const places = await Place.find(filter)
      .limit(parseInt(limit, 10))
      .populate('createdBy', 'name email role');

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

    const regex = new RegExp(q.trim(), 'i');
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
    const initialStatus = 'verified';

    const lat = coordinates?.lat || 11.0168;
    const lng = coordinates?.lng || 76.9558;

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
        categoryStats,
        districtStats
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

module.exports = {
  getPlaces,
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
  getProviderStatus
};
