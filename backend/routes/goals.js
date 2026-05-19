const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const Entry = require('../models/Entry');

// Helper to get current week label
function getCurrentWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// GET goals for current week + actual hours from entries
router.get('/', async (req, res) => {
  try {
    const week = req.query.week || getCurrentWeek();
    const goals = await Goal.find({ weekLabel: week }).sort({ createdAt: 1 });

    // Calculate actual hours from entries this week
    const monday = getMondayOfWeek(week);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const entries = await Entry.find({
      date: { $gte: monday, $lte: sunday },
    });

    const actualHoursMap = {};
    entries.forEach((e) => {
      actualHoursMap[e.topic] = (actualHoursMap[e.topic] || 0) + e.timeSpent;
    });

    const goalsWithActual = goals.map((g) => ({
      ...g.toObject(),
      actualHours: Math.round((actualHoursMap[g.topic] || 0) * 10) / 10,
    }));

    // Total hours this week
    const totalActual = Object.values(actualHoursMap).reduce((a, b) => a + b, 0);
    const totalTarget = goals.reduce((a, g) => a + g.targetHours, 0);

    res.json({
      success: true,
      data: {
        week,
        goals: goalsWithActual,
        summary: {
          totalActual: Math.round(totalActual * 10) / 10,
          totalTarget: Math.round(totalTarget * 10) / 10,
          topicActuals: actualHoursMap,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create goal
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body, weekLabel: req.body.weekLabel || getCurrentWeek() };
    const goal = new Goal(data);
    await goal.save();
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update goal
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE goal
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function getMondayOfWeek(weekLabel) {
  // weekLabel: "YYYY-WWW"
  const [year, wStr] = weekLabel.split('-W');
  const week = parseInt(wStr, 10);
  const jan1 = new Date(parseInt(year, 10), 0, 1);
  const jan1Day = jan1.getDay() || 7;
  const daysToMonday = jan1Day <= 4 ? 1 - jan1Day : 8 - jan1Day;
  const firstMonday = new Date(jan1);
  firstMonday.setDate(jan1.getDate() + daysToMonday);
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

module.exports = router;
