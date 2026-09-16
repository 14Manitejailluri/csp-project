import { Favorite } from '../models/Favorite.js';
import { Donation } from '../models/Donation.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name organizationName phone location' },
      })
      .sort({ createdAt: -1 });

    const donations = favorites.map((f) => f.donation).filter(Boolean);
    return ApiResponse.success(res, { favorites: donations });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const { donationId } = req.params;

    const existing = await Favorite.findOne({ user: req.user._id, donation: donationId });
    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return ApiResponse.success(res, { isFavorited: false }, 'Donation removed from favorites');
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return next(ApiError.notFound('Donation not found'));
    }

    await Favorite.create({ user: req.user._id, donation: donationId });
    return ApiResponse.created(res, { isFavorited: true }, 'Donation saved to your favorites');
  } catch (error) {
    next(error);
  }
};
