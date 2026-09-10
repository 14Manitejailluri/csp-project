import { sendEmail } from '../config/email.js';

export const sendClaimNotificationEmail = async ({ donor, ngo, donation }) => {
  if (!donor || !donor.email) return;

  const subject = `[FoodRescue] Your donation "${donation.title}" has been claimed!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #059669;">Great News! Your Food Donation was Claimed</h2>
      <p>Hello <strong>${donor.name}</strong>,</p>
      <p>Verified NGO <strong>${ngo.organizationName || ngo.name}</strong> has just claimed your surplus food donation:</p>
      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Food:</strong> ${donation.title} (${donation.quantity} ${donation.quantityUnit})</p>
        <p style="margin: 5px 0;"><strong>Category:</strong> ${donation.foodType}</p>
        <p style="margin: 5px 0;"><strong>Pickup Deadline:</strong> ${new Date(donation.pickupDeadline).toLocaleString()}</p>
      </div>
      <p>A volunteer will be dispatched soon to pick up the food from your location.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Thank you for making a positive environmental and social impact with FoodRescue.</p>
    </div>
  `;
  return await sendEmail({ to: donor.email, subject, html, text: `Your donation "${donation.title}" has been claimed by ${ngo.organizationName || ngo.name}.` });
};

export const sendVolunteerAssignmentEmail = async ({ volunteer, pickup, donation, donor, ngo }) => {
  if (!volunteer || !volunteer.email) return;

  const subject = `[FoodRescue] New Pickup Task Assigned: "${donation.title}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0284c7;">New Food Rescue Mission Assigned!</h2>
      <p>Hello <strong>${volunteer.name}</strong>,</p>
      <p>You have been assigned to rescue food for <strong>${ngo.organizationName || ngo.name}</strong>.</p>
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Food Item:</strong> ${donation.title} (${donation.quantity} ${donation.quantityUnit})</p>
        <p style="margin: 5px 0;"><strong>Pickup Location:</strong> ${pickup.pickupAddress.address}, ${pickup.pickupAddress.city}</p>
        <p style="margin: 5px 0;"><strong>Donor Contact:</strong> ${donor.name} (${donor.phone || 'Phone in App'})</p>
        <p style="margin: 5px 0;"><strong>Storage Condition:</strong> ${donation.storageCondition}</p>
      </div>
      <p>Please log in to your dashboard to view the map route and mark pickup status.</p>
    </div>
  `;
  return await sendEmail({ to: volunteer.email, subject, html, text: `New pickup task assigned for "${donation.title}".` });
};

export const sendDeliveryConfirmationEmail = async ({ donor, ngo, donation }) => {
  if (!donor || !donor.email) return;

  const subject = `[FoodRescue] Success! Your donation has been safely delivered`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #059669;">Food Rescued & Delivered Successfully!</h2>
      <p>Hello <strong>${donor.name}</strong>,</p>
      <p>Your generous food donation <strong>"${donation.title}"</strong> has been successfully delivered to <strong>${ngo.organizationName || ngo.name}</strong>.</p>
      <p>Together, you just prevented food waste and fed people in need!</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 20px;">FoodRescue Platform</p>
    </div>
  `;
  return await sendEmail({ to: donor.email, subject, html, text: `Your donation "${donation.title}" has been successfully delivered!` });
};
