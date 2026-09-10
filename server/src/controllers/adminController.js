import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';
import { Claim } from '../models/Claim.js';
import { Pickup } from '../models/Pickup.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { createNotification } from '../services/notificationService.js';
import { calculateImpactStats, normalizeQuantityToKg } from '../services/impactService.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, isVerified, isActive, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return ApiResponse.paginated(
      res,
      users,
      {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      'Users retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const verifyNgo = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    if (user.role !== 'ngo') {
      return next(ApiError.badRequest('Verification is only applicable for NGO accounts'));
    }

    const isVerified = req.body.isVerified !== undefined ? req.body.isVerified : true;
    user.isVerified = isVerified;
    await user.save();

    await createNotification({
      recipient: user._id,
      title: isVerified ? 'NGO Account Verified!' : 'NGO Verification Status Updated',
      message: isVerified
        ? 'Congratulations! Your NGO organization has been verified. You can now claim surplus food donations across the platform.'
        : 'Your NGO verification status has been updated by an administrator.',
      type: 'VERIFICATION_UPDATE',
    });

    return ApiResponse.success(
      res,
      { user },
      `NGO ${isVerified ? 'verified' : 'unverified'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    if (user._id.toString() === req.user._id.toString()) {
      return next(ApiError.badRequest('You cannot deactivate your own admin account'));
    }

    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();

    return ApiResponse.success(
      res,
      { user },
      `User account ${user.isActive ? 'reactivated' : 'suspended'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminDonations = async (req, res, next) => {
  try {
    const { status, foodType, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (foodType) query.foodType = foodType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
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
      'Admin donations retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const allDonations = await Donation.find().lean();
    const impactStats = calculateImpactStats(allDonations);

    // Group by food category
    const categoryBreakdown = {};
    for (const d of allDonations) {
      const cat = d.foodType || 'Other';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { count: 0, kg: 0 };
      }
      categoryBreakdown[cat].count++;
      if (d.status === 'DELIVERED') {
        categoryBreakdown[cat].kg += normalizeQuantityToKg(d.quantity, d.quantityUnit);
      }
    }

    // Format category data
    const categories = Object.keys(categoryBreakdown).map((name) => ({
      name,
      count: categoryBreakdown[name].count,
      rescuedKg: Math.round(categoryBreakdown[name].kg * 10) / 10,
    }));

    return ApiResponse.success(
      res,
      {
        impact: impactStats,
        categories,
        generatedAt: new Date(),
      },
      'Platform report data generated'
    );
  } catch (error) {
    next(error);
  }
};
