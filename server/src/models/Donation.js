import mongoose from 'mongoose';

export const DONOR_TYPES = [
  'Hostel',
  'Restaurant',
  'Hotel',
  'Marriage/Function Hall',
  'College',
  'Canteen',
  'Event Organizer',
  'Individual',
  'Other',
];

export const DIETARY_TYPES = ['Vegetarian', 'Non-Vegetarian', 'Vegan'];

export const FOOD_CATEGORIES = [
  'Cooked food',
  'Packaged food',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Groceries',
  'Other',
];

export const QUANTITY_UNITS = ['meals', 'servings', 'kg', 'lbs', 'packets', 'boxes', 'liters', 'units'];

export const STORAGE_CONDITIONS = [
  'Room Temperature',
  'Refrigerated',
  'Frozen',
  'Hot Holding',
  'Dry Storage',
];

export const DONATION_STATUSES = [
  'PENDING_VERIFICATION',
  'VERIFIED',
  'AVAILABLE',
  'REQUESTED',
  'CLAIMED',
  'ASSIGNED',
  'PICKED_UP',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
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
    foodName: {
      type: String,
      trim: true,
      default: '',
    },
    donorType: {
      type: String,
      enum: DONOR_TYPES,
      default: 'Restaurant',
      index: true,
    },
    dietaryType: {
      type: String,
      enum: DIETARY_TYPES,
      default: 'Vegetarian',
      index: true,
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
      required: [true, 'Please specify the food category/type'],
      index: true,
    },
    foodCategory: {
      type: String,
      trim: true,
      default: 'Cooked food',
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide the quantity'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    quantityUnit: {
      type: String,
      enum: QUANTITY_UNITS,
      default: 'meals',
    },
    preparedAt: {
      type: Date,
      required: [true, 'Please provide preparation date/time'],
    },
    pickupDeadline: {
      type: Date,
      required: [true, 'Please provide available-until / pickup deadline date/time'],
      index: true,
    },
    availableUntil: {
      type: Date,
      default: function () {
        return this.pickupDeadline;
      },
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
    images: {
      type: [String],
      default: [],
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },
    pickupInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    safetyConfirmed: {
      type: Boolean,
      default: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'],
      default: 'VERIFIED',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
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
        required: [true, 'Street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        default: '',
        trim: true,
      },
      pincode: {
        type: String,
        default: '',
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
    completedAt: {
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 2dsphere index for geospatial queries
DonationSchema.index({ location: '2dsphere' });
DonationSchema.index({ status: 1, pickupDeadline: 1 });
DonationSchema.index({ donor: 1, createdAt: -1 });

export const Donation = mongoose.model('Donation', DonationSchema);

