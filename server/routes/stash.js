// server/routes/stash.js
const express = require('express');
const router = express.Router();
const YarnStash = require('../models/YarnStash');
const auth = require('../middleware/auth');

// Midpoint-style starter estimates based on common yardage ranges by yarn weight.
// These are approximate on purpose and can be tuned later.
const YARDS_PER_GRAM = {
  '0 - Lace': 6.75,         // ~675 yd / 100g
  '1 - Super Fine': 4.2,    // ~420 yd / 100g
  '2 - Fine': 3.3,          // ~330 yd / 100g
  '3 - Light': 2.6,         // ~260 yd / 100g
  '4 - Medium': 2.2,        // ~220 yd / 100g
  '5 - Bulky': 1.45,        // ~145 yd / 100g
  '6 - Super Bulky': 0.9,   // ~90 yd / 100g
  '7 - Jumbo': 0.6          // ~60 yd / 100g
};

function roundToWholeNumber(value) {
  return Math.round(value);
}

function buildYarnPayload(body) {
  const grams =
    body.grams === undefined || body.grams === '' ? undefined : Number(body.grams);

  const yardage =
    body.yardage === undefined || body.yardage === '' ? undefined : Number(body.yardage);

  const quantity =
    body.quantity === undefined || body.quantity === '' ? 1 : Number(body.quantity);

  const payload = {
    brand: body.brand?.trim(),
    fiberContent: body.fiberContent?.trim(),
    weight: body.weight,
    color: body.color?.trim(),
    grams,
    dyeLot: body.dyeLot?.trim(),
    quantity,
    notes: body.notes?.trim()
  };

  if (yardage !== undefined && !Number.isNaN(yardage)) {
    payload.yardage = yardage;
    payload.estimatedYardage = yardage;
    payload.yardageSource = 'user';
  } else if (
    grams !== undefined &&
    !Number.isNaN(grams) &&
    body.weight &&
    YARDS_PER_GRAM[body.weight]
  ) {
    payload.yardage = undefined;
    payload.estimatedYardage = roundToWholeNumber(grams * YARDS_PER_GRAM[body.weight]);
    payload.yardageSource = 'estimated';
  } else {
    payload.yardage = undefined;
    payload.estimatedYardage = undefined;
    payload.yardageSource = 'estimated';
  }

  return payload;
}

// POST /api/stash - Add new yarn to stash
router.post('/', auth, async (req, res) => {
  try {
    const payload = buildYarnPayload(req.body);

    const newYarn = new YarnStash({
      ...payload,
      userId: req.user.id
    });

    const savedYarn = await newYarn.save();
    res.status(201).json(savedYarn);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/stash - Get ALL yarn for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const yarnList = await YarnStash.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(yarnList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/stash/:id - Get single yarn entry
router.get('/:id', auth, async (req, res) => {
  try {
    const yarn = await YarnStash.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!yarn) {
      return res.status(404).json({ message: 'Yarn not found' });
    }

    res.json(yarn);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/stash/:id - Update yarn entry
router.put('/:id', auth, async (req, res) => {
  try {
    const payload = buildYarnPayload(req.body);

    const updatedYarn = await YarnStash.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      payload,
      { new: true, runValidators: true }
    );

    if (!updatedYarn) {
      return res.status(404).json({ message: 'Yarn not found' });
    }

    res.json(updatedYarn);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/stash/:id - Delete yarn entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedYarn = await YarnStash.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deletedYarn) {
      return res.status(404).json({ message: 'Yarn not found' });
    }

    res.json({ message: 'Yarn deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;