import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';
import { Claim } from '../models/Claim.js';
import { Pickup } from '../models/Pickup.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { calculateImpactStats } from '../services/impactService.js';

export const getDonorAnalytics = async (req, res, next) => {
  try {
    const donorId = req.user._id;
    const donations = await Donation.find({ donor: donorId });
    const stats = calculateImpactStats(donations);

    const recentDonations = await Donation.find({ donor: donorId })
      .populate('claimedBy', 'name organizationName')
      .populate('volunteer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return ApiResponse.success(
      res,
      {
        stats,
        recentDonations,
      },
      'Donor analytics retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getNgoAnalytics = async (req, res, next) => {
  try {
    const ngoId = req.user._id;

    const [availableNearbyCount, claimedDonations, claims] = await Promise.all([
      Donation.countDocuments({ status: 'AVAILABLE', pickupDeadline: { $gt: new Date() } }),
      Donation.find({ claimedBy: ngoId }),
      Claim.find({ ngo: ngoId }).populate('donation'),
    ]);

    const stats = calculateImpactStats(claimedDonations);

    return ApiResponse.success(
      res,
      {
        stats: {
          ...stats,
          availableNearby: availableNearbyCount,
          totalClaimed: claims.length,
        },
      },
      'NGO analytics retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getVolunteerAnalytics = async (req, res, next) => {
  try {
    const volunteerId = req.user._id;

    const [availableTasksCount, assignedPickups, completedPickups] = await Promise.all([
      Pickup.countDocuments({ volunteer: null, status: 'ASSIGNED' }),
      Pickup.find({ volunteer: volunteerId, status: { $in: ['ASSIGNED', 'PICKED_UP'] } }).populate('donation'),
      Pickup.find({ volunteer: volunteerId, status: 'DELIVERED' }).populate('donation'),
    ]);

    const deliveredDonations = completedPickups.map((p) => p.donation).filter(Boolean);
    const impact = calculateImpactStats(deliveredDonations);

    return ApiResponse.success(
      res,
      {
        stats: {
          availablePickups: availableTasksCount,
          activePickups: assignedPickups.length,
          completedPickups: completedPickups.length,
          totalDeliveries: completedPickups.length,
          foodRescuedKg: impact.foodRescuedKg,
          mealsRescued: impact.mealsRescued,
          co2OffsetKg: impact.co2OffsetKg,
        },
      },
      'Volunteer analytics retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalNgos,
      totalVolunteers,
      pendingNgoVerifications,
      allDonations,
      totalClaims,
      totalPickups,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'ngo', isVerified: false }),
      Donation.find().select('status quantity quantityUnit createdAt'),
      Claim.countDocuments(),
      Pickup.countDocuments(),
    ]);

    const stats = calculateImpactStats(allDonations);

    return ApiResponse.success(
      res,
      {
        users: {
          total: totalUsers,
          donors: totalDonors,
          ngos: totalNgos,
          volunteers: totalVolunteers,
          pendingNgoVerifications,
        },
        donations: {
          total: stats.totalDonations,
          active: stats.activeDonations,
          completed: stats.completedDonations,
          expired: stats.expiredDonations,
          cancelled: stats.cancelledDonations,
        },
        impact: {
          foodRescuedKg: stats.foodRescuedKg,
          mealsRescued: stats.mealsRescued,
          co2OffsetKg: stats.co2OffsetKg,
          waterSavedLiters: stats.waterSavedLiters,
        },
        activity: {
          totalClaims,
          totalPickups,
        },
      },
      'Admin system analytics retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalDonations, completedDonations] = await Promise.all([
      User.countDocuments(),
      Donation.countDocuments(),
      Donation.find({ status: { $in: ['COMPLETED', 'DELIVERED', 'PICKED_UP'] } }),
    ]);

    const impact = calculateImpactStats(completedDonations);

    return ApiResponse.success(
      res,
      {
        totalUsers,
        totalDonations,
        completedRescues: completedDonations.length,
        foodRescuedKg: impact.foodRescuedKg,
        mealsRescued: impact.mealsRescued,
        co2OffsetKg: impact.co2OffsetKg,
        waterSavedLiters: impact.waterSavedLiters,
      },
      'Platform public analytics retrieved'
    );
  } catch (error) {
    next(error);
  }
};

