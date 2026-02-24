console.log("stash.js file is being loaded!");

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // adjust path if your middleware is elsewhere
const YarnStash = require('../models/YarnStash'); // make sure model exists!

// POST /api/stash - Create new yarn entry
router.post('/', auth, async (req, res) => {
  try {
    const yarn = new YarnStash({
      ...req.body,
      userId: req.user._id  // ← this comes from your auth middleware
    });
    await yarn.save();
    res.status(201).json(yarn);
  } catch (err) {
    console.error(err); // log for debugging
    res.status(400).json({ error: err.message });
  }
});

// GET /api/stash - List all user's yarn
router.get('/', auth, async (req, res) => {
  try {
    const yarns = await YarnStash.find({ userId: req.user._id });
    res.json(yarns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ← You can add PUT /:id, DELETE /:id, GET /:id later — same pattern

module.exports = router;