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
      } else {
        // All tasks for this volunteer OR unassigned tasks
        query.$or = [{ volunteer: req.user._id }, { volunteer: null, status: 'ASSIGNED' }];
      }
    } else if (req.user.role === 'ngo') {
      query.ngo = req.user._id;
    } else if (req.user.role === 'donor') {
      query.donor = req.user._id;
    }

    if (status) {
      query.status = status;
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

    const pickup = await Pickup.create({
      donation: donation._id,
      donor: donation.donor,
      ngo: req.user._id,
      volunteer: volunteerId || null,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      pickupAddress: {
        address: donation.location.address,
        city: donation.location.city,
        state: donation.location.state,
        coordinates: donation.location.coordinates,
      },
      deliveryAddress: {
        address: req.user.location?.address || 'NGO Distribution Point',
        city: req.user.location?.city || donation.location.city,
        state: req.user.location?.state || donation.location.state,
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

    if (pickup.status === 'DELIVERED' || pickup.status === 'CANCELLED') {
      return next(
        ApiError.badRequest(`Cannot assign volunteer to a pickup that is ${pickup.status}`)
      );
    }

    // Determine target volunteer ID: if user is volunteer, they self-claim; otherwise from body
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

    pickup.volunteer = volunteer._id;
    if (req.body.scheduledTime) {
      pickup.scheduledTime = new Date(req.body.scheduledTime);
    }
    pickup.status = 'ASSIGNED';
    await pickup.save();

    // Update Donation status and volunteer reference
    await Donation.findByIdAndUpdate(pickup.donation._id, {
      status: 'ASSIGNED',
      volunteer: volunteer._id,
    });

    // Update Claim status
    await Claim.findOneAndUpdate(
      { donation: pickup.donation._id },
      { status: 'ASSIGNED' }
    );

    // Dispatches
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

export const markPickedUp = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('donor')
      .populate('ngo');

    if (!pickup) {
      return next(ApiError.notFound('Pickup task not found'));
    }

    // Authorization: Only assigned volunteer or admin can mark picked up
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
    await pickup.save();

    // Update Donation
    await Donation.findByIdAndUpdate(pickup.donation._id, {
      status: 'PICKED_UP',
      pickedUpAt: pickedUpDate,
    });

    const volunteer = await User.findById(pickup.volunteer || req.user._id);

    // Notifications
    notifyFoodPickedUp(pickup, pickup.donation, volunteer);

    return ApiResponse.success(res, { pickup }, 'Food marked as picked up successfully');
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

    // Authorization: Only assigned volunteer or admin can mark delivered
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
    if (req.body.proofImageUrl) pickup.proofImageUrl = req.body.proofImageUrl;
    await pickup.save();

    // Update Donation
    await Donation.findByIdAndUpdate(pickup.donation._id, {
      status: 'DELIVERED',
      deliveredAt: deliveredDate,
    });

    // Update Claim
    await Claim.findOneAndUpdate(
      { donation: pickup.donation._id },
      { status: 'COMPLETED' }
    );

    const volunteer = await User.findById(pickup.volunteer || req.user._id);

    // Notifications & Email
    notifyFoodDelivered(pickup, pickup.donation, volunteer);
    sendDeliveryConfirmationEmail({
      donor: pickup.donor,
      ngo: pickup.ngo,
      donation: pickup.donation,
    });

    return ApiResponse.success(
      res,
      { pickup },
      'Food marked as delivered! Environmental and community impact recorded.'
    );
  } catch (error) {
    next(error);
  }
};
