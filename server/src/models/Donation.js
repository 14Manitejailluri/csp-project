import mongoose from 'mongoose';

export const FOOD_CATEGORIES = [
  'Cooked food',
  'Packaged food',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Groceries',
  'Other',
];

export const QUANTITY_UNITS = ['kg', 'lbs', 'servings', 'packets', 'boxes', 'liters', 'units'];

export const STORAGE_CONDITIONS = [
  'Room Temperature',
  'Refrigerated',
  'Frozen',
  'Hot Holding',
  'Dry Storage',
];

export const DONATION_STATUSES = [
  'AVAILABLE',
  'CLAIMED',
  'ASSIGNED',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED',
  'EXPIRED',
];

const DonationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donation must have a donor'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a food title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    foodType: {
      type: String,
      enum: FOOD_CATEGORIES,
      required: [true, 'Please specify the food type'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide the quantity'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    quantityUnit: {
      type: String,
      enum: QUANTITY_UNITS,
      default: 'kg',
    },
    preparedAt: {
      type: Date,
      required: [true, 'Please provide preparation date/time'],
    },
    pickupDeadline: {
      type: Date,
      required: [true, 'Please provide pickup deadline'],
      index: true,
    },
    storageCondition: {
      type: String,
      enum: STORAGE_CONDITIONS,
      default: 'Room Temperature',
    },
    allergens: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      // [longitude, latitude]
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates [lng, lat] are required'],
        default: [0, 0],
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
    },
    status: {
      type: String,
      enum: DONATION_STATUSES,
      default: 'AVAILABLE',
      index: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    claimedAt: {
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
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial queries
DonationSchema.index({ location: '2dsphere' });
DonationSchema.index({ status: 1, pickupDeadline: 1 });
DonationSchema.index({ donor: 1, createdAt: -1 });

export const Donation = mongoose.model('Donation', DonationSchema);
