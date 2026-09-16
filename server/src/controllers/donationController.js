import { Donation } from '../models/Donation.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { uploadImageToStorage } from '../config/cloudinary.js';
import { notifyNearbyNGOs } from '../services/notificationService.js';
import { calculateDistanceKm } from '../services/geoService.js';

export const createDonation = async (req, res, next) => {
  try {
    const {
      title,
      foodName,
      donorType,
      dietaryType,
      description,
      foodType,
      quantity,
      quantityUnit,
      preparedAt,
      pickupDeadline,
      availableUntil,
      storageCondition,
      allergens,
      address,
      city,
      state,
      pincode,
      contactNumber,
      pickupInstructions,
      latitude,
      longitude,
      notes,
    } = req.body;

    // Handle image upload if provided
    let imageUrl = '';
    let images = [];
    if (req.file) {
      imageUrl = await uploadImageToStorage(req.file);
      images.push(imageUrl);
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
      images.push(imageUrl);
    } else if (req.body.images && Array.isArray(req.body.images)) {
      images = req.body.images.slice(0, 3);
      imageUrl = images[0] || '';
    }

    let parsedAllergens = [];
    if (allergens) {
      if (Array.isArray(allergens)) {
        parsedAllergens = allergens;
      } else if (typeof allergens === 'string') {
        try {
          parsedAllergens = JSON.parse(allergens);
        } catch {
          parsedAllergens = allergens.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    const finalTitle = title || foodName || 'Surplus Food Donation';
    const finalDeadline = new Date(pickupDeadline || availableUntil);
    const finalPreparedAt = new Date(preparedAt || Date.now());
    const finalLat = parseFloat(latitude) || 0;
    const finalLng = parseFloat(longitude) || 0;

    const donation = await Donation.create({
      donor: req.user._id,
      title: finalTitle,
      donorType: donorType || 'Restaurant',
      dietaryType: dietaryType || 'Vegetarian',
      description: description || '',
      foodType: foodType || 'Cooked food',
      quantity: parseFloat(quantity) || 1,
      quantityUnit: quantityUnit || 'meals',
      preparedAt: finalPreparedAt,
      pickupDeadline: finalDeadline,
      storageCondition: storageCondition || 'Room Temperature',
      allergens: parsedAllergens,
      imageUrl: imageUrl || '',
      images: images,
      contactNumber: contactNumber || req.user.phone || '',
      pickupInstructions: pickupInstructions || notes || '',
      location: {
        type: 'Point',
        coordinates: [finalLng, finalLat],
        address: address || 'Main Donor Location',
        city: city || 'City',
        state: state || '',
        pincode: pincode || '',
      },
      notes: notes || pickupInstructions || '',
      status: 'AVAILABLE',
    });

    const populatedDonation = await Donation.findById(donation._id).populate(
      'donor',
      'name email phone organizationName'
    );

    // Notify nearby verified NGOs in the background
    notifyNearbyNGOs(populatedDonation);

    return ApiResponse.created(
      res,
      { donation: populatedDonation },
      'Surplus food posted successfully and is now available for NGO requests.'
    );
  } catch (error) {
    next(error);
  }
};

export const getAllDonations = async (req, res, next) => {
  try {
    const {
      status,
      foodType,
      donor,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Donors can view all their own donations by default
    if (req.user.role === 'donor') {
      query.donor = req.user._id;
    } else if (donor) {
      query.donor = donor;
    }

    if (status) {
      query.status = status;
    }

    if (foodType) {
      query.foodType = foodType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [donations, total] = await Promise.all([
      Donation.find(query)
        .populate('donor', 'name email phone organizationName')
        .populate('claimedBy', 'name email organizationName phone')
        .populate('volunteer', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Donation.countDocuments(query),
    ]);

    return ApiResponse.paginated(
      res,
      donations,
      {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      'Donations retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getAvailableDonations = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radiusKm = 50,
      foodType,
      minQuantity,
      maxQuantity,
      search,
    } = req.query;

    const baseQuery = {
      status: 'AVAILABLE',
      pickupDeadline: { $gt: new Date() },
    };

    if (foodType) {
      baseQuery.foodType = foodType;
    }

    if (minQuantity || maxQuantity) {
      baseQuery.quantity = {};
      if (minQuantity) baseQuery.quantity.$gte = parseFloat(minQuantity);
      if (maxQuantity) baseQuery.quantity.$lte = parseFloat(maxQuantity);
    }

    if (search) {
      baseQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    let userCoordinates = null;
    if (lat && lng) {
      userCoordinates = [parseFloat(lng), parseFloat(lat)];
    } else if (req.user && req.user.location && req.user.location.coordinates) {
      const [uLng, uLat] = req.user.location.coordinates;
      if (uLng !== 0 || uLat !== 0) {
        userCoordinates = [uLng, uLat];
      }
    }

    let donations = [];

    // If coordinates are provided, perform geospatial query or distance sorting
    if (userCoordinates && !isNaN(userCoordinates[0]) && !isNaN(userCoordinates[1])) {
      const radiusMeters = parseFloat(radiusKm) * 1000;

      try {
        donations = await Donation.find({
          ...baseQuery,
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: userCoordinates,
              },
              $maxDistance: radiusMeters,
            },
          },
        })
          .populate('donor', 'name email phone organizationName')
          .lean();
      } catch {
        // Fallback in case 2dsphere index has not finished building in test environment
        donations = await Donation.find(baseQuery)
          .populate('donor', 'name email phone organizationName')
          .lean();
      }
    } else {
      donations = await Donation.find(baseQuery)
        .populate('donor', 'name email phone organizationName')
        .sort({ createdAt: -1 })
        .lean();
    }

    // Attach calculated distance
    const processedDonations = donations.map((donation) => {
      const dist = userCoordinates
        ? calculateDistanceKm(userCoordinates, donation.location.coordinates)
        : null;
      return {
        ...donation,
        distanceKm: dist,
      };
    });

    return ApiResponse.success(
      res,
      { donations: processedDonations },
      'Available surplus donations retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone organizationName')
      .populate('claimedBy', 'name email organizationName phone')
      .populate('volunteer', 'name email phone');

    if (!donation) {
      return next(ApiError.notFound('Donation not found'));
    }

    return ApiResponse.success(res, { donation });
  } catch (error) {
    next(error);
  }
};

export const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return next(ApiError.notFound('Donation not found'));
    }

    // Only donor owner or admin can update
    if (
      donation.donor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(ApiError.forbidden('You do not have permission to edit this donation'));
    }

    // Can only edit if still AVAILABLE
    if (donation.status !== 'AVAILABLE') {
      return next(
        ApiError.badRequest(
          `Cannot edit donation. Current status is already ${donation.status}.`
        )
      );
    }

    const {
      title,
      description,
      foodType,
      quantity,
      quantityUnit,
      preparedAt,
      pickupDeadline,
      storageCondition,
      allergens,
      address,
      city,
      state,
      latitude,
      longitude,
    } = req.body;

    if (title) donation.title = title;
    if (description !== undefined) donation.description = description;
    if (foodType) donation.foodType = foodType;
    if (quantity) donation.quantity = parseFloat(quantity);
    if (quantityUnit) donation.quantityUnit = quantityUnit;
    if (preparedAt) donation.preparedAt = new Date(preparedAt);
    if (pickupDeadline) donation.pickupDeadline = new Date(pickupDeadline);
    if (storageCondition) donation.storageCondition = storageCondition;

    if (allergens) {
      if (Array.isArray(allergens)) {
        donation.allergens = allergens;
      } else if (typeof allergens === 'string') {
        try {
          donation.allergens = JSON.parse(allergens);
        } catch {
          donation.allergens = allergens.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    if (address) donation.location.address = address;
    if (city) donation.location.city = city;
    if (state) donation.location.state = state;
    if (latitude && longitude) {
      donation.location.coordinates = [parseFloat(longitude), parseFloat(latitude)];
    }

    if (req.file) {
      donation.imageUrl = await uploadImageToStorage(req.file);
    }

    await donation.save();

    const updated = await Donation.findById(donation._id).populate(
      'donor',
      'name email phone organizationName'
    );

    return ApiResponse.success(res, { donation: updated }, 'Donation updated successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return next(ApiError.notFound('Donation not found'));
    }

    if (
      donation.donor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(ApiError.forbidden('You do not have permission to cancel this donation'));
    }

    if (donation.status !== 'AVAILABLE') {
      return next(
        ApiError.badRequest(
          `Cannot cancel donation. Only AVAILABLE donations can be cancelled. Current status: ${donation.status}`
        )
      );
    }

    donation.status = 'CANCELLED';
    await donation.save();

    return ApiResponse.success(res, { donation }, 'Donation cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return next(ApiError.notFound('Donation not found'));
    }

    if (
      donation.donor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(ApiError.forbidden('You do not have permission to delete this donation'));
    }

    await Donation.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, {}, 'Donation deleted successfully');
  } catch (error) {
    next(error);
  }
};
