import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = 'GENERAL',
  relatedDonation = null,
  relatedPickup = null,
}) => {
  try {
    return await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      relatedDonation,
      relatedPickup,
    });
  } catch (err) {
    console.error('[Notification Creation Error]:', err.message);
    return null;
  }
};

/**
 * Notify nearby verified NGOs when a new donation is published
 */
export const notifyNearbyNGOs = async (donation) => {
  try {
    // Find verified and active NGOs
    const ngos = await User.find({
      role: 'ngo',
      isActive: true,
      isVerified: true,
    }).limit(20);

    const notifications = ngos.map((ngo) => ({
      recipient: ngo._id,
      sender: donation.donor,
      title: 'New Food Donation Available Nearby',
      message: `"${donation.title}" (${donation.quantity} ${donation.quantityUnit}) is now available in ${donation.location.city}.`,
      type: 'NEW_DONATION',
      relatedDonation: donation._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('[notifyNearbyNGOs Error]:', err.message);
  }
};

export const notifyDonationClaimed = async (donation, ngo) => {
  return await createNotification({
    recipient: donation.donor,
    sender: ngo._id,
    title: 'Donation Claimed by NGO',
    message: `Your donation "${donation.title}" was claimed by ${ngo.organizationName || ngo.name}.`,
    type: 'DONATION_CLAIMED',
    relatedDonation: donation._id,
  });
};

export const notifyVolunteerAssigned = async (pickup, volunteer, donation, ngo) => {
  // Notify volunteer
  await createNotification({
    recipient: volunteer._id,
    sender: ngo._id,
    title: 'New Pickup Task Assigned',
    message: `You have been assigned to pick up "${donation.title}" from ${donation.location.address}.`,
    type: 'VOLUNTEER_ASSIGNED',
    relatedDonation: donation._id,
    relatedPickup: pickup._id,
  });

  // Notify donor
  await createNotification({
    recipient: donation.donor,
    title: 'Volunteer Courier Assigned',
    message: `Volunteer ${volunteer.name} has been assigned to pick up your donation "${donation.title}".`,
    type: 'VOLUNTEER_ASSIGNED',
    relatedDonation: donation._id,
    relatedPickup: pickup._id,
  });
};

export const notifyFoodPickedUp = async (pickup, donation, volunteer) => {
  // Notify NGO
  await createNotification({
    recipient: pickup.ngo,
    sender: volunteer._id,
    title: 'Food Has Been Picked Up',
    message: `Volunteer ${volunteer.name} has picked up "${donation.title}" and is en route to delivery.`,
    type: 'FOOD_PICKED_UP',
    relatedDonation: donation._id,
    relatedPickup: pickup._id,
  });

  // Notify Donor
  await createNotification({
    recipient: pickup.donor,
    sender: volunteer._id,
    title: 'Food Picked Up Successfully',
    message: `Volunteer ${volunteer.name} has collected your donation "${donation.title}". Thank you!`,
    type: 'FOOD_PICKED_UP',
    relatedDonation: donation._id,
    relatedPickup: pickup._id,
  });
};

export const notifyFoodDelivered = async (pickup, donation, volunteer) => {
  // Notify NGO
  await createNotification({
    recipient: pickup.ngo,
    sender: volunteer._id,
    title: 'Food Donation Delivered!',
    message: `"${donation.title}" has been safely delivered by volunteer ${volunteer.name}.`,
    type: 'FOOD_DELIVERED',
    relatedDonation: donation._id,
    relatedPickup: pickup._id,
  });

  // Notify Donor
  await createNotification({
    recipient: pickup.donor,
    sender: volunteer._id,
    title: 'Donation Completed & Delivered!',
    message: `Your food donation "${donation.title}" has been safely delivered to the NGO. Impact recorded!`,
    type: 'FOOD_DELIVERED',
    relatedDonation: donation._id,
    relatedPickup: pickup._id,
  });
};

export const notifyDonationExpired = async (donation) => {
  return await createNotification({
    recipient: donation.donor,
    title: 'Donation Expired',
    message: `Your donation "${donation.title}" reached its pickup deadline before being claimed and was marked as expired.`,
    type: 'DONATION_EXPIRED',
    relatedDonation: donation._id,
  });
};
