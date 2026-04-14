const express = require('express');
const router = express.Router();
const Pattern = require('../models/Pattern'); // We'll create this model next
const auth = require('../middleware/auth');   // Your existing JWT middleware
const upload = require('../middleware/upload');

// ========================
// Protected CRUD Routes for Patterns
// All routes require authentication and enforce user ownership
// ========================

// @route   POST /api/patterns
// @desc    Create a new pattern
router.post('/', auth, upload.single('patternFile'), async (req, res) => {
  try {
    // ✅ ADD THIS BLOCK RIGHT HERE
    if (req.body.materials && typeof req.body.materials === 'string') {
      req.body.materials = JSON.parse(req.body.materials);
    }

    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }

    if (req.body.isPublic !== undefined) {
      req.body.isPublic = req.body.isPublic === 'true' || req.body.isPublic === true;
    }
    const pattern = new Pattern({
      ...req.body,
      userId: req.user.id,
      patternFile: req.file ? req.file.path : null
    });

    await pattern.save();
    res.json(pattern);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/patterns
// @desc    Get all patterns for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const patterns = await Pattern.find({ userId: req.user.id })
      .sort({ createdAt: -1 });   // Most recent first

    res.json(patterns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/patterns/:id
// @desc    Get a single pattern by ID (only if it belongs to the user)
router.get('/:id', auth, async (req, res) => {
  try {
    const pattern = await Pattern.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!pattern) {
      return res.status(404).json({ message: 'Pattern not found or access denied' });
    }

    res.json(pattern);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/patterns/:id
// @desc    Update a pattern (only if it belongs to the user)
router.put('/:id', auth, async (req, res) => {
  try {
    const pattern = await Pattern.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!pattern) {
      return res.status(404).json({ message: 'Pattern not found or access denied' });
    }

    res.json({
      message: 'Pattern updated successfully',
      pattern
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating pattern', error: error.message });
  }
});

// @route   DELETE /api/patterns/:id
// @desc    Delete a pattern (only if it belongs to the user)
router.delete('/:id', auth, async (req, res) => {
  try {
    const pattern = await Pattern.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!pattern) {
      return res.status(404).json({ message: 'Pattern not found or access denied' });
    }

    res.json({ message: 'Pattern deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;