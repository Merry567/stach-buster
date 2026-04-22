const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    yarnWeight: {
      type: String,
      enum: [
        'lace',
        'fingering',
        'sport',
        'dk',
        'worsted',
        'aran',
        'bulky',
        'super-bulky',
        'other',
      ],
      trim: true,
    },
    fiberContent: {
      type: String,
      trim: true,
    },
    yardage: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const patternSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['knit', 'crochet', 'both'],
      required: true,
    },

    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },

    estTime: {
      type: Number,
      min: 0,
    },

    materials: [materialSchema],

    patternFileId: {
      type: String,
    },

    patternFileName: {
    type: String,
    },

    coverImage: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    tags: [String],

    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pattern', patternSchema);