// server/routes/stash.js
const express = require('express');
const router = express.Router();
const YarnStash = require('../models/YarnStash');
const auth = require('../middleware/auth');

// ========================
//  PROTECTED CRUD ROUTES
// ========================

// POST /api/stash - Add new yarn to stash
router.post('/', auth, async (req, res) => {
  try {
    const newYarn = new YarnStash({
      ...req.body,
      userId: req.user.id          // Important: use req.user.id (from your JWT payload)
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
    const yarnList = await YarnStash.find({ userId: req.user.id })
      .sort({ createdAt: -1 });   // newest first
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
    const updatedYarn = await YarnStash.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
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