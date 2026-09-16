import crypto from 'crypto';
import { Pickup } from '../models/Pickup.js';
import { Donation } from '../models/Donation.js';
import { Claim } from '../models/Claim.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import {
  notifyVolunteerAssigned,
  notifyFoodPickedUp,
  notifyFoodDelivered,
  createNotification,
} from '../services/notificationService.js';
import {
  sendVolunteerAssignmentEmail,
  sendDeliveryConfirmationEmail,
} from '../services/emailService.js';

export const getPickups = async (req, res, next) => {
  try {
    const { status, availableOnly } = req.query;
    const query = {};

    if (req.user.role === 'volunteer') {
      if (availableOnly === 'true') {
        // Pickups that don't have a volunteer assigned yet
        query.volunteer = null;
        query.status = 'ASSIGNED';
      } else if (status) {
        const statusValues = String(status).split(',').map((s) => s.trim()).filter(Boolean);
        const statusFilter = statusValues.length === 1 ? statusValues[0] : { $in: statusValues };
        query.volunteer = req.user._id;
        query.status = statusFilter;
      } else {
        query.$or = [{ volunteer: req.user._id }, { volunteer: null, status: 'ASSIGNED' }];
      }
    } else if (req.user.role === 'ngo') {
      query.ngo = req.user._id;
      if (status) {
        const statusValues = String(status).split(',').map((s) => s.trim()).filter(Boolean);
        query.status = statusValues.length === 1 ? statusValues[0] : { $in: statusValues };
      }
    } else if (req.user.role === 'donor') {
      query.donor = req.user._id;
      if (status) {
        const statusValues = String(status).split(',').map((s) => s.trim()).filter(Boolean);
        query.status = statusValues.length === 1 ? statusValues[0] : { $in: statusValues };
      }
    } else {
      if (status) {
        const statusValues = String(status).split(',').map((s) => s.trim()).filter(Boolean);
        query.status = statusValues.length === 1 ? statusValues[0] : { $in: statusValues };
      }
    }

    const pickups = await Pickup.find(query)
      .populate('donation')
      .populate('donor', 'name email phone organizationName location')
      .populate('ngo', 'name email phone organizationName location')
      .populate('volunteer', 'name email phone')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { pickups });
  } catch (error) {
    next(error);
  }
};

export const getPickupById = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('donor', 'name email phone organizationName location')
      .populate('ngo', 'name email phone organizationName location')
      .populate('volunteer', 'name email phone');

    if (!pickup) {
      return next(ApiError.notFound('Pickup task not found'));
    }

    return ApiResponse.success(res, { pickup });
  } catch (error) {
    next(error);
  }
};

export const createPickup = async (req, res, next) => {
  try {
    const { donationId, volunteerId, scheduledTime, notes } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return next(ApiError.notFound('Donation not found'));
    }

    const secureToken = crypto.randomBytes(16).toString('hex');

    const pickup = await Pickup.create({
      donation: donation._id,
      donor: donation.donor,
      ngo: req.user._id,
      volunteer: volunteerId || null,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      secureToken: secureToken,
      qrCode: secureToken,
      pickupAddress: {
        address: donation.location.address,
        city: donation.location.city,
        state: donation.location.state,
        pincode: donation.location.pincode,
        coordinates: donation.location.coordinates,
      },
      deliveryAddress: {
        address: req.user.location?.address || 'NGO Distribution Center',
        city: req.user.location?.city || donation.location.city,
        state: req.user.location?.state || donation.location.state,
        pincode: req.user.location?.pincode || donation.location.pincode,
        coordinates: req.user.location?.coordinates || [0, 0],
      },
      status: 'ASSIGNED',
      notes: notes || '',
    });

    return ApiResponse.created(res, { pickup }, 'Pickup scheduled successfully');
  } catch (error) {
    next(error);
  }
};

export const assignVolunteer = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('donor')
      .populate('ngo');

    if (!pickup) {
      return next(ApiError.notFound('Pickup task not found'));
    }

    if (pickup.status === 'DELIVERED' || pickup.status === 'COMPLETED' || pickup.status === 'CANCELLED') {
      return next(
        ApiError.badRequest(`Cannot assign volunteer to a pickup that is ${pickup.status}`)
      );
    }

    let targetVolunteerId;
    if (req.user.role === 'volunteer') {
      targetVolunteerId = req.user._id;
    } else {
      targetVolunteerId = req.body.volunteerId;
      if (!targetVolunteerId) {
        return next(ApiError.badRequest('Please provide a volunteer ID'));
      }
    }

    const volunteer = await User.findById(targetVolunteerId);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return next(ApiError.badRequest('Assigned user is not a valid volunteer'));
    }

    // Ensure secure token exists for QR verification
    if (!pickup.secureToken) {
      const token = crypto.randomBytes(16).toString('hex');
      pickup.secureToken = token;
      pickup.qrCode = token;
    }

    pickup.volunteer = volunteer._id;
    if (req.body.scheduledTime) {
      pickup.scheduledTime = new Date(req.body.scheduledTime);
    }
    pickup.status = 'ASSIGNED';
    await pickup.save();

    await Donation.findByIdAndUpdate(pickup.donation._id, {
      status: 'ASSIGNED',
      volunteer: volunteer._id,
    });

    await Claim.findOneAndUpdate(
      { donation: pickup.donation._id },
      { status: 'ASSIGNED' }
    );

    notifyVolunteerAssigned(pickup, volunteer, pickup.donation, pickup.ngo);
    sendVolunteerAssignmentEmail({
      volunteer,
      pickup,
      donation: pickup.donation,
      donor: pickup.donor,
      ngo: pickup.ngo,
    });

    const updatedPickup = await Pickup.findById(pickup._id)
      .populate('donation')
      .populate('donor', 'name email phone organizationName location')
      .populate('ngo', 'name email phone organizationName location')
      .populate('volunteer', 'name email phone');

    return ApiResponse.success(
      res,
      { pickup: updatedPickup },
      'Volunteer assigned to rescue pickup mission'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Generate / retrieve secure one-time token for QR code display (Donor/Hostel view)
 */
export const generatePickupQR = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id).populate('donation');
    if (!pickup) {
      return next(ApiError.notFound('Pickup task not found'));
    }

    // Only donor, NGO, or admin can access the QR generator
    const isDonor = pickup.donor.toString() === req.user._id.toString();
    const isNgo = pickup.ngo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isDonor && !isNgo && !isAdmin) {
      return next(ApiError.forbidden('Only the donor or authorized organization can display the pickup QR code'));
    }

    if (!pickup.secureToken) {
      pickup.secureToken = crypto.randomBytes(16).toString('hex');
      pickup.qrCode = pickup.secureToken;
      await pickup.save();
    }

    return ApiResponse.success(
      res,
      {
        pickupId: pickup._id,
        secureToken: pickup.secureToken,
        qrPayload: JSON.stringify({
          pickupId: pickup._id.toString(),
          token: pickup.secureToken,
        }),
        foodName: pickup.donation?.title || pickup.donation?.foodName || 'Food Rescue',
        quantity: `${pickup.donation?.quantity} ${pickup.donation?.quantityUnit}`,
      },
      'QR Code generated successfully for secure pickup verification.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify scanned QR code (Volunteer view)
 */
export const verifyPickupQR = async (req, res, next) => {
  try {
    const { token, secureToken: bodyToken } = req.body;
    const tokenToVerify = (token || bodyToken || '').trim();

    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('volunteer', 'name email phone')
      .populate('donor', 'name organizationName');

    if (!pickup) {
      return next(ApiError.notFound('Pickup task not found'));
    }

    if (!tokenToVerify) {
      return next(ApiError.badRequest('Pickup verification code/token is required'));
    }

    if (!pickup.secureToken || pickup.secureToken !== tokenToVerify) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired pickup code. Please scan the authorized donor QR code.',
      });
    }

    const verifiedDate = new Date();
    pickup.qrVerifiedAt = verifiedDate;
    await pickup.save();

    return ApiResponse.success(
      res,
      {
        verified: true,
        pickupId: pickup._id,
        foodName: pickup.donation?.title || pickup.donation?.foodName || 'Donated Food',
        quantity: `${pickup.donation?.quantity} ${pickup.donation?.quantityUnit}`,
        volunteerName: pickup.volunteer?.name || req.user.name,
        donorName: pickup.donor?.organizationName || pickup.donor?.name || 'Authorized Donor',
        verifiedAt: verifiedDate,
      },
      'Pickup Verified successfully! You may now confirm food collection.'
    );
  } catch (error) {
    next(error);
  }
};

export const markPickedUp = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('donor')
      .populate('ngo');

    if (!pickup) {
      return next(ApiError.notFound('Pickup task not found'));
    }

    if (
      req.user.role === 'volunteer' &&
      pickup.volunteer?.toString() !== req.user._id.toString()
    ) {
      return next(
        ApiError.forbidden('Only the assigned volunteer can update this pickup task')
      );
    }

    if (pickup.status !== 'ASSIGNED') {
      return next(
        ApiError.badRequest(
          `Invalid transition: cannot mark picked up from status "${pickup.status}"`
        )
      );
    }

    const pickedUpDate = new Date();
    pickup.status = 'PICKED_UP';
    pickup.pickedUpAt = pickedUpDate;
    if (req.body.notes) pickup.notes = req.body.notes;
    if (req.body.pickupProofPhoto) pickup.pickupProofPhoto = req.body.pickupProofPhoto;
    if (req.body.proofImageUrl) pickup.proofImageUrl = req.body.proofImageUrl;
    
    // Invalidate single-use token after confirmation
    pickup.secureToken = '';
    await pickup.save();

    await Donation.findByIdAndUpdate(pickup.donation._id, {
      status: 'PICKED_UP',
      pickedUpAt: pickedUpDate,
    });

    const volunteer = await User.findById(pickup.volunteer || req.user._id);

    notifyFoodPickedUp(pickup, pickup.donation, volunteer);

    return ApiResponse.success(res, { pickup }, 'Food marked as picked up successfully with proof.');
  } catch (error) {
    next(error);
  }
};

export const markDelivered = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('donor')
      .populate('ngo');

    if (!pickup) {
      return next(ApiError.notFound('Pickup task not found'));
    }

    if (
      req.user.role === 'volunteer' &&
      pickup.volunteer?.toString() !== req.user._id.toString()
    ) {
      return next(
        ApiError.forbidden('Only the assigned volunteer can update this delivery status')
      );
    }

    if (pickup.status !== 'PICKED_UP') {
      return next(
        ApiError.badRequest(
          `Invalid transition: food must be picked up before marking as delivered. Current status: "${pickup.status}"`
        )
      );
    }

    const deliveredDate = new Date();
    pickup.status = 'DELIVERED';
    pickup.deliveredAt = deliveredDate;
    if (req.body.notes) pickup.notes = req.body.notes;
    if (req.body.deliveryProofPhoto) pickup.deliveryProofPhoto = req.body.deliveryProofPhoto;
    if (req.body.proofImageUrl) pickup.proofImageUrl = req.body.proofImageUrl;
    await pickup.save();

    await Donation.findByIdAndUpdate(pickup.donation._id, {
      status: 'DELIVERED',
      deliveredAt: deliveredDate,
    });

    await Claim.findOneAndUpdate(
      { donation: pickup.donation._id },
      { status: 'DELIVERED' }
    );

    const volunteer = await User.findById(pickup.volunteer || req.user._id);

    notifyFoodDelivered(pickup, pickup.donation, volunteer);
    sendDeliveryConfirmationEmail({
      donor: pickup.donor,
      ngo: pickup.ngo,
      donation: pickup.donation,
    });

    return ApiResponse.success(
      res,
      { pickup },
      'Food marked as delivered to NGO shelter with delivery proof.'
    );
  } catch (error) {
    next(error);
  }
};

export const confirmReceipt = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('donor')
      .populate('ngo')
      .populate('volunteer');

    if (!pickup) {
      return next(ApiError.notFound('Pickup task not found'));
    }

    // Only NGO or Admin can confirm receipt
    if (req.user.role === 'ngo' && pickup.ngo._id.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Only the recipient NGO can confirm food delivery receipt'));
    }

    const completedDate = new Date();
    pickup.status = 'COMPLETED';
    pickup.completedAt = completedDate;
    await pickup.save();

    await Donation.findByIdAndUpdate(pickup.donation._id, {
      status: 'COMPLETED',
      completedAt: completedDate,
    });

    await Claim.findOneAndUpdate(
      { donation: pickup.donation._id },
      { status: 'COMPLETED' }
    );

    // Notify Donor & Volunteer of complete rescue
    await Promise.all([
      createNotification({
        recipient: pickup.donor._id,
        title: 'Food Donation Completed! 🎉',
        message: `Your donation "${pickup.donation.title}" has been successfully delivered and confirmed by ${pickup.ngo.organizationName || pickup.ngo.name}. Certificate is now available!`,
        type: 'FOOD_DELIVERED',
        relatedDonation: pickup.donation._id,
        relatedPickup: pickup._id,
      }),
      pickup.volunteer
        ? createNotification({
            recipient: pickup.volunteer._id,
            title: 'Mission Completed! 🌟',
            message: `The NGO has verified receipt of "${pickup.donation.title}". Thank you for your volunteer service!`,
            type: 'FOOD_DELIVERED',
            relatedDonation: pickup.donation._id,
            relatedPickup: pickup._id,
          })
        : Promise.resolve(),
    ]);

    return ApiResponse.success(
      res,
      { pickup },
      'Food receipt confirmed! Donation is now successfully completed.'
    );
  } catch (error) {
    next(error);
  }
};

export const getCertificateData = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('donor', 'name organizationName email')
      .populate('ngo', 'name organizationName email registrationNumber')
      .populate('volunteer', 'name email');

    if (!pickup) {
      return next(ApiError.notFound('Certificate not found for this mission'));
    }

    const certData = {
      certificateId: `CERT-${pickup._id.toString().substring(18).toUpperCase()}-${new Date(pickup.completedAt || pickup.createdAt).getFullYear()}`,
      donationId: pickup.donation?._id,
      foodName: pickup.donation?.title || pickup.donation?.foodName || 'Nutritious Surplus Food',
      quantity: `${pickup.donation?.quantity || 1} ${pickup.donation?.quantityUnit || 'meals'}`,
      donorName: pickup.donor?.organizationName || pickup.donor?.name || 'Generous Donor',
      ngoName: pickup.ngo?.organizationName || pickup.ngo?.name || 'Partner NGO',
      volunteerName: pickup.volunteer?.name || 'Community Volunteer',
      completedDate: pickup.completedAt || pickup.deliveredAt || pickup.updatedAt,
      city: pickup.pickupAddress?.city || 'Community Hub',
    };

    return ApiResponse.success(res, { certificate: certData }, 'Certificate details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

