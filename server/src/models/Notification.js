import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = [
  'NEW_DONATION',
  'DONATION_CLAIMED',
  'VOLUNTEER_ASSIGNED',
  'PICKUP_REMINDER',
  'FOOD_PICKED_UP',
  'FOOD_DELIVERED',
  'DONATION_EXPIRED',
  'VERIFICATION_UPDATE',
  'GENERAL',
];

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: 'GENERAL',
    },
    relatedDonation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      default: null,
    },
    relatedPickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pickup',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
