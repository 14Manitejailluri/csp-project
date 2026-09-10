import mongoose from 'mongoose';

export const PICKUP_STATUSES = ['ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];

const PickupSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: [true, 'Pickup must reference a donation'],
      index: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pickup must reference a donor'],
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pickup must reference an NGO'],
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    pickupAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      coordinates: { type: [Number], default: [0, 0] },
    },
    deliveryAddress: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    scheduledTime: {
      type: Date,
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: PICKUP_STATUSES,
      default: 'ASSIGNED',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    proofImageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

PickupSchema.index({ volunteer: 1, status: 1 });

export const Pickup = mongoose.model('Pickup', PickupSchema);

