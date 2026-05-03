const express = require('express');
const router = express.Router();
const ErrorLog = require('../models/ErrorLog');

// GET /api/errors - List all errors
router.get('/', async (req, res) => {
  try {
    const { category, severity, resolved, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (resolved !== undefined) filter.resolved = resolved === 'true';
    if (search) {
      filter.$or = [
        { error: { $regex: search, $options: 'i' } },
        { solution: { $regex: search, $options: 'i' } },
        { context: { $regex: search, $options: 'i' } },
      ];
    }

    const errors = await ErrorLog.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, data: errors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/errors/stats
router.get('/stats', async (req, res) => {
  try {
    const errors = await ErrorLog.find();
    const total = errors.length;
    const resolved = errors.filter((e) => e.resolved).length;
    const unresolved = total - resolved;

    const severityMap = { low: 0, medium: 0, high: 0, critical: 0 };
    const categoryMap = {};
    let totalOccurrences = 0;

    errors.forEach((e) => {
      severityMap[e.severity]++;
      categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
      totalOccurrences += e.occurrences;
    });

    // Frequent errors (pattern detection)
    const frequent = [...errors]
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5)
      .map((e) => ({
        error: e.error.substring(0, 80),
        occurrences: e.occurrences,
        category: e.category,
        resolved: e.resolved,
      }));

    res.json({
      success: true,
      data: {
        total,
        resolved,
        unresolved,
        totalOccurrences,
        severityBreakdown: severityMap,
        categoryBreakdown: categoryMap,
        frequentErrors: frequent,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/errors/suggest/:search - Suggest fixes for similar errors
router.get('/suggest/:search', async (req, res) => {
  try {
    const searchTerm = req.params.search;
    const matches = await ErrorLog.find({
      $or: [
        { error: { $regex: searchTerm, $options: 'i' } },
        { context: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ],
      resolved: true,
      solution: { $ne: '' },
    })
      .sort({ occurrences: -1 })
      .limit(5);

    res.json({
      success: true,
      data: matches.map((m) => ({
        error: m.error,
        solution: m.solution,
        category: m.category,
        occurrences: m.occurrences,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/errors
router.post('/', async (req, res) => {
  try {
    // Check for existing similar error
    const existing = await ErrorLog.findOne({
      error: { $regex: `^${req.body.error.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      category: req.body.category,
    });

    if (existing) {
      existing.occurrences += 1;
      if (req.body.solution) existing.solution = req.body.solution;
      if (req.body.resolved !== undefined) existing.resolved = req.body.resolved;
      await existing.save();
      return res.json({ success: true, data: existing, duplicate: true });
    }

    const errorLog = new ErrorLog(req.body);
    const saved = await errorLog.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/errors/:id
router.put('/:id', async (req, res) => {
  try {
    const errorLog = await ErrorLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!errorLog)
      return res.status(404).json({ success: false, message: 'Error not found' });
    res.json({ success: true, data: errorLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/errors/:id/resolve - Mark as resolved
router.patch('/:id/resolve', async (req, res) => {
  try {
    const errorLog = await ErrorLog.findById(req.params.id);
    if (!errorLog)
      return res.status(404).json({ success: false, message: 'Error not found' });
    errorLog.resolved = !errorLog.resolved;
    if (req.body.solution) errorLog.solution = req.body.solution;
    await errorLog.save();
    res.json({ success: true, data: errorLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/errors/:id
router.delete('/:id', async (req, res) => {
  try {
    const errorLog = await ErrorLog.findByIdAndDelete(req.params.id);
    if (!errorLog)
      return res.status(404).json({ success: false, message: 'Error not found' });
    res.json({ success: true, message: 'Error deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
