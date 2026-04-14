const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  yarnWeight: {
  type: String,
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
  required: true
},
  fiberContent: String,
  yardage: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

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

  // ✅ knit vs crochet (already close to what you had)
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

  estTime: Number,

  // ✅ structured materials (IMPORTANT for matching later)
  materials: [materialSchema],

  // ✅ NEW: PDF upload
  patternFile: {
    type: String, // store file path or URL
  },

  // optional preview image
  coverImage: String,

  notes: String,
  tags: [String],

  isPublic: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('Pattern', patternSchema);