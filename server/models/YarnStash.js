// server/models/YarnStash.js
const mongoose = require('mongoose');

const yarnStashSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    brand: {
      type: String,
      required: true,
      trim: true
    },

    fiberContent: {
      type: String,
      required: true,
      trim: true
    },

    weight: {
      type: String,
      required: true,
      enum: [
        '0 - Lace',
        '1 - Super Fine',
        '2 - Fine',
        '3 - Light',
        '4 - Medium',
        '5 - Bulky',
        '6 - Super Bulky',
        '7 - Jumbo'
      ],
      trim: true
    },

    color: {
      type: String,
      required: true,
      trim: true
    },

    grams: {
      type: Number,
      required: true,
      min: 0
    },

    // User-entered exact yardage, if known
    yardage: {
      type: Number,
      min: 0
    },

    // Auto-calculated estimate when exact yardage is missing
    estimatedYardage: {
      type: Number,
      min: 0
    },

    // Helps the frontend show whether it was estimated
    yardageSource: {
      type: String,
      enum: ['user', 'estimated'],
      default: 'estimated'
    },

    dyeLot: {
      type: String,
      trim: true
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Optional: useful derived value for matching/display
yarnStashSchema.virtual('usableYardage').get(function () {
  return this.yardage ?? this.estimatedYardage ?? 0;
});

yarnStashSchema.set('toJSON', { virtuals: true });
yarnStashSchema.set('toObject', { virtuals: true });

yarnStashSchema.index({
  brand: 'text',
  color: 'text',
  fiberContent: 'text'
});

const YarnStash = mongoose.model('YarnStash', yarnStashSchema);

module.exports = YarnStash;