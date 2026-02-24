const mongoose = require('mongoose');

const yarnStashSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: { type: String, trim: true },
  fiberContent: { type: String, trim: true }, // e.g. "Merino Wool", "Acrylic"
  weight: { type: String },                   // "Worsted", "DK", "Fingering" etc.
  color: { type: String },
  grams: { type: Number, min: 0 },
  yardage: { type: Number, min: 0 },
  dyeLot: { type: String },
  quantity: { type: Number, default: 1 },     // number of skeins/balls
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('YarnStash', yarnStashSchema);