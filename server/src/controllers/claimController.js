import { Donation } from '../models/Donation.js';
import { Claim } from '../models/Claim.js';
import { Pickup } from '../models/Pickup.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { notifyDonationClaimed } from '../services/notificationService.js';
import { sendClaimNotificationEmail } from '../services/emailService.js';

export const claimDonation = async (req, res, next) => {
  try {
    const { donationId, notes } = req.body;
    const ngoId = req.user._id;

    // Verify NGO user verification status
    if (req.user.role === 'ngo' && !req.user.isVerified) {
      return next(
        ApiError.forbidden(
          'Your NGO account is pending verification by an administrator. You cannot claim donations yet.'
        )
      );
    }

    // ATOMIC DATABASE OPERATION:
    // We atomically update donation ONLY if its current status is 'AVAILABLE'
    const donation = await Donation.findOneAndUpdate(
      {
        _id: donationId,
        status: 'AVAILABLE',
        pickupDeadline: { $gt: new Date() },
      },
      {
        $set: {
          status: 'CLAIMED',
          claimedBy: ngoId,
          claimedAt: new Date(),
        },
      },
      { new: true }
    ).populate('donor', 'name email phone organizationName location');

    if (!donation) {
      // Check why update didn't match: already claimed or expired or doesn't exist
      const checkExists = await Donation.findById(donationId);
      if (!checkExists) {
        return next(ApiError.notFound('Donation not found'));
      }
      if (checkExists.status !== 'AVAILABLE') {
        return next(
          ApiError.conflict(
            `This donation is no longer available. Current status: ${checkExists.status}`
          )
        );
      }
      if (new Date(checkExists.pickupDeadline) <= new Date()) {
        return next(ApiError.badRequest('This donation has already passed its pickup deadline.'));
      }
      return next(ApiError.badRequest('Unable to claim this donation.'));
    }

    // Create Claim record
    const claim = await Claim.create({
      donation: donation._id,
      ngo: ngoId,
      status: 'CLAIMED',
      notes: notes || '',
    });

    // Create Pickup record (awaiting volunteer assignment)
    const pickup = await Pickup.create({
      donation: donation._id,
      donor: donation.donor._id,
      ngo: ngoId,
      pickupAddress: {
        address: donation.location.address,
        city: donation.location.city,
        state: donation.location.state,
        coordinates: donation.location.coordinates,
      },
      deliveryAddress: {
        address: req.user.location?.address || 'NGO Distribution Center',
        city: req.user.location?.city || donation.location.city,
        state: req.user.location?.state || donation.location.state,
        coordinates: req.user.location?.coordinates || [0, 0],
      },
      status: 'ASSIGNED',
      notes: notes || '',
    });

    // Dispatch in-app notification & transactional email
    notifyDonationClaimed(donation, req.user);
    sendClaimNotificationEmail({
      donor: donation.donor,
      ngo: req.user,
      donation,
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate('donation')
      .populate('ngo', 'name email organizationName phone');

    return ApiResponse.created(
      res,
      {
        claim: populatedClaim,
        pickupId: pickup._id,
        donation,
      },
      'Donation successfully claimed! Pickup task generated.'
    );
  } catch (error) {
    next(error);
  }
};

export const getClaims = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'ngo') {
      query.ngo = req.user._id;
    }

    const claims = await Claim.find(query)
      .populate({
        path: 'donation',
        populate: [
          { path: 'donor', select: 'name email phone organizationName location' },
          { path: 'volunteer', select: 'name email phone' },
        ],
      })
      .populate('ngo', 'name email organizationName phone')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { claims });
  } catch (error) {
    next(error);
  }
};

export const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate({
        path: 'donation',
        populate: [
          { path: 'donor', select: 'name email phone organizationName location' },
          { path: 'volunteer', select: 'name email phone' },
        ],
      })
      .populate('ngo', 'name email organizationName phone');

    if (!claim) {
      return next(ApiError.notFound('Claim not found'));
    }

    // Permission check
    if (
      req.user.role === 'ngo' &&
      claim.ngo._id.toString() !== req.user._id.toString()
    ) {
      return next(ApiError.forbidden('You do not have access to this claim'));
    }

    return ApiResponse.success(res, { claim });
  } catch (error) {
    next(error);
  }
};
