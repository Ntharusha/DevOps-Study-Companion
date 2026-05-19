const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// GET all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ success: true, data: habits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create habit
router.post('/', async (req, res) => {
  try {
    const habit = new Habit(req.body);
    await habit.save();
    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH toggle completion for today
router.patch('/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const year = new Date().getFullYear();
    const weekNum = getWeekNumber(new Date());
    const week = `${year}-W${String(weekNum).padStart(2, '0')}`;

    const alreadyDone = habit.completions.some((c) => c.date === today);

    if (alreadyDone) {
      // Un-complete
      habit.completions = habit.completions.filter((c) => c.date !== today);
    } else {
      // Complete
      habit.completions.push({ date: today, week });
    }

    // Recalculate streaks
    const { current, longest } = calculateStreak(habit.completions);
    habit.currentStreak = current;
    habit.longestStreak = Math.max(longest, habit.longestStreak);

    await habit.save();
    res.json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update habit
router.put('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });
    res.json({ success: true, data: habit });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Helpers ----
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function calculateStreak(completions) {
  if (!completions.length) return { current: 0, longest: 0 };

  const dates = [...new Set(completions.map((c) => c.date))].sort().reverse();
  let current = 0;
  let longest = 0;
  let temp = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (dates[i] === expectedStr) {
      temp++;
      if (i === 0 || dates[0] === today) current = temp;
    } else {
      longest = Math.max(longest, temp);
      temp = 1;
    }
  }
  longest = Math.max(longest, temp, current);
  return { current, longest };
}

module.exports = router;
