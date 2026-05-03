const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');

// GET /api/memory - List all items
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { concept: { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } }
      ];
    }
    const items = await Memory.find(filter).sort({ strength: 1, nextReview: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/memory - Add new item
router.post('/', async (req, res) => {
  try {
    const item = new Memory(req.body);
    const saved = await item.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/memory/:id/review - Update strength after review
router.patch('/:id/review', async (req, res) => {
  try {
    const { strength } = req.body;
    const item = await Memory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.strength = strength;
    item.lastReviewed = new Date();
    
    // Simple Spaced Repetition Logic (simplified)
    const daysToAdd = strength * 2; // e.g. if strength 5, review in 10 days
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    item.nextReview = nextDate;

    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/memory/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await Memory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
