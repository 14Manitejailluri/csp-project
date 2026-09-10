import mongoose from 'mongoose';

const ClaimSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: [true, 'Claim must belong to a donation'],
      index: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claim must be by an NGO'],
      index: true,
    },
    status: {
      type: String,
      enum: ['CLAIMED', 'ASSIGNED', 'COMPLETED', 'CANCELLED'],
      default: 'CLAIMED',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active claims for the same donation & NGO
ClaimSchema.index({ donation: 1, ngo: 1 }, { unique: true });

export const Claim = mongoose.model('Claim', ClaimSchema);
