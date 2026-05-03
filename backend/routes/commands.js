const express = require('express');
const router = express.Router();
const Command = require('../models/Command');

// GET /api/commands - List all commands
router.get('/', async (req, res) => {
  try {
    const { category, favorite, search, sort = '-createdAt' } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (favorite === 'true') filter.isFavorite = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { command: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const commands = await Command.find(filter).sort(sort).limit(200);
    res.json({ success: true, data: commands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/commands/stats
router.get('/stats', async (req, res) => {
  try {
    const commands = await Command.find();
    const total = commands.length;
    const favorites = commands.filter((c) => c.isFavorite).length;
    const totalUses = commands.reduce((sum, c) => sum + c.useCount, 0);

    const categoryMap = {};
    commands.forEach((c) => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    });

    const mostUsed = [...commands]
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 5)
      .map((c) => ({ title: c.title, command: c.command, useCount: c.useCount }));

    res.json({
      success: true,
      data: { total, favorites, totalUses, categoryBreakdown: categoryMap, mostUsed },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/commands
router.post('/', async (req, res) => {
  try {
    const command = new Command(req.body);
    const saved = await command.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/commands/:id
router.put('/:id', async (req, res) => {
  try {
    const command = await Command.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!command)
      return res.status(404).json({ success: false, message: 'Command not found' });
    res.json({ success: true, data: command });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/commands/:id/use - Increment use count
router.post('/:id/use', async (req, res) => {
  try {
    const command = await Command.findByIdAndUpdate(
      req.params.id,
      { $inc: { useCount: 1 }, lastUsed: new Date() },
      { new: true }
    );
    if (!command)
      return res.status(404).json({ success: false, message: 'Command not found' });
    res.json({ success: true, data: command });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/commands/:id/favorite - Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const command = await Command.findById(req.params.id);
    if (!command)
      return res.status(404).json({ success: false, message: 'Command not found' });
    command.isFavorite = !command.isFavorite;
    await command.save();
    res.json({ success: true, data: command });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/commands/:id
router.delete('/:id', async (req, res) => {
  try {
    const command = await Command.findByIdAndDelete(req.params.id);
    if (!command)
      return res.status(404).json({ success: false, message: 'Command not found' });
    res.json({ success: true, message: 'Command deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
