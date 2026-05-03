const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');

// GET /api/labs - List all labs
router.get('/', async (req, res) => {
  try {
    const { topic, status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (topic) filter.topic = topic;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Lab.countDocuments(filter);
    const labs = await Lab.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: labs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/labs/stats - Lab statistics
router.get('/stats', async (req, res) => {
  try {
    const labs = await Lab.find();
    const totalLabs = labs.length;
    const completed = labs.filter((l) => l.status === 'completed').length;
    const totalSteps = labs.reduce((sum, l) => sum + l.steps.length, 0);
    const totalErrors = labs.reduce((sum, l) => sum + l.labErrors.length, 0);
    const resolvedErrors = labs.reduce(
      (sum, l) => sum + l.labErrors.filter((e) => e.resolved).length,
      0
    );
    const totalMinutes = labs.reduce((sum, l) => sum + l.duration, 0);

    // Topic breakdown
    const topicMap = {};
    labs.forEach((l) => {
      topicMap[l.topic] = (topicMap[l.topic] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalLabs,
        completed,
        inProgress: labs.filter((l) => l.status === 'in-progress').length,
        totalSteps,
        totalErrors,
        resolvedErrors,
        totalMinutes,
        topicBreakdown: Object.entries(topicMap).map(([topic, count]) => ({
          topic,
          count,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/labs/:id
router.get('/:id', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found' });
    res.json({ success: true, data: lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/labs
router.post('/', async (req, res) => {
  try {
    const lab = new Lab(req.body);
    const saved = await lab.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/labs/:id
router.put('/:id', async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found' });
    res.json({ success: true, data: lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/labs/:id/steps - Add a step to a lab
router.post('/:id/steps', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found' });
    lab.steps.push(req.body);
    await lab.save();
    res.json({ success: true, data: lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/labs/:id/errors - Add an error to a lab
router.post('/:id/errors', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found' });
    lab.labErrors.push(req.body);
    await lab.save();
    res.json({ success: true, data: lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/labs/:id
router.delete('/:id', async (req, res) => {
  try {
    const lab = await Lab.findByIdAndDelete(req.params.id);
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found' });
    res.json({ success: true, message: 'Lab deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
