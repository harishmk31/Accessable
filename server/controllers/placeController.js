const Place = require('../models/Place');
const Review = require('../models/Review');

const VALID_FACILITY_VALUES = ['Available', 'Unavailable', 'Unknown'];

// Helper to sanitize facility inputs
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
      result[key] = 'Unknown'; // Never assume unavailable if missing
    }
  });

  return result;
};

// @desc    Get all places with search, filter, and pagination
// @route   GET /api/places
// @access  Public
const getPlaces = async (req, res, next) => {
  try {
    const {
      q,
      category,
      wheelchairRamp,
      elevatorLift,
      accessibleToilet,
      accessibleParking,
      brailleSignage,
      audioAssistance,
      minRating,
      minAccessibilityRating,
      city,
      status,
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    // Verification status filter
    // Non-admin queries default to verified places only
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

    // City filter
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    // Search query across name, description, address, city, state
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
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

    const [total, places] = await Promise.all([
      Place.countDocuments(filter),
      Place.find(filter)
        .populate('createdBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
    ]);

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
      city,
      state,
      postalCode,
      contactNumber,
      website,
      coordinates,
      facilities,
      facilityNotes,
      tags,
      images
    } = req.body;

    if (!name || !description || !category || !address || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, category, address, city, and state'
      });
    }

    const sanitizedFacilities = sanitizeFacilities(facilities);

    // If submitted by regular user, status is 'verified' by default so it's immediately visible
    // or pending review if needed. For this discovery platform, default 'verified' ensures full UX.
    const initialStatus = 'verified';

    const place = await Place.create({
      name: name.trim(),
      description: description.trim(),
      category,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode ? postalCode.trim() : '',
      contactNumber: contactNumber ? contactNumber.trim() : '',
      website: website ? website.trim() : '',
      coordinates: coordinates || { lat: 0, lng: 0 },
      facilities: sanitizedFacilities,
      facilityNotes: facilityNotes || {},
      tags: Array.isArray(tags) ? tags : [],
      images: Array.isArray(images) && images.length > 0 ? images : [],
      status: initialStatus,
      createdBy: req.user._id
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

    // Check authorization: user must be the place creator or an admin
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
      city,
      state,
      postalCode,
      contactNumber,
      website,
      coordinates,
      facilities,
      facilityNotes,
      tags,
      images,
      status,
      verificationNote
    } = req.body;

    if (name) place.name = name.trim();
    if (description) place.description = description.trim();
    if (category) place.category = category;
    if (address) place.address = address.trim();
    if (city) place.city = city.trim();
    if (state) place.state = state.trim();
    if (postalCode !== undefined) place.postalCode = postalCode.trim();
    if (contactNumber !== undefined) place.contactNumber = contactNumber.trim();
    if (website !== undefined) place.website = website.trim();
    if (coordinates) place.coordinates = coordinates;
    if (tags) place.tags = Array.isArray(tags) ? tags : place.tags;
    if (images) place.images = Array.isArray(images) ? images : place.images;

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

    // Only admin can change verification status
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

    // Remove associated reviews
    await Review.deleteMany({ place: place._id });
    await Place.findByIdAndDelete(place._id);

    res.json({
      success: true,
      message: 'Place and associated reviews deleted successfully'
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
        verificationNote: verificationNote || ''
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
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalPlaces,
        verifiedPlaces,
        pendingPlaces,
        rejectedPlaces,
        totalReviews,
        facilityCounts,
        categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  verifyPlace,
  getPlaceStats
};
