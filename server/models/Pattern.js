const mongoose = require('mongoose');

const patternSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['knit', 'crochet', 'both'],
    required: true
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  estTime: {
    type: Number,        // estimated hours to complete
    min: 0
  },
  materials: [{
    yarnWeight: String,
    fiberContent: String,
    yardage: Number,
    quantity: Number
  }],
  notes: String,
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  coverImage: String   // URL for future image upload
}, {
  timestamps: true
});

// Text index for searching by name and tags
patternSchema.index({ name: 'text', tags: 'text' });

const Pattern = mongoose.model('Pattern', patternSchema);
module.exports = Pattern;