const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// GET /api/entries - Get all entries (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { topic, difficulty, startDate, endDate, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Entry.countDocuments(filter);
    const entries = await Entry.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: entries,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/entries/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 });
    const totalEntries = entries.length;
    const totalHours = entries.reduce((sum, e) => sum + e.timeSpent, 0);

    // Calculate unique study days
    const uniqueDays = new Set(
      entries.map((e) => new Date(e.date).toISOString().split('T')[0])
    );
    const totalStudyDays = uniqueDays.size;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedDays = Array.from(uniqueDays).sort().reverse();

    if (sortedDays.length > 0) {
      const latestDay = new Date(sortedDays[0]);
      latestDay.setHours(0, 0, 0, 0);

      const diffFromToday = Math.floor(
        (today - latestDay) / (1000 * 60 * 60 * 24)
      );

      // Streak is valid if last entry was today or yesterday
      if (diffFromToday <= 1) {
        currentStreak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          const current = new Date(sortedDays[i - 1]);
          const prev = new Date(sortedDays[i]);
          const diff = Math.floor(
            (current - prev) / (1000 * 60 * 60 * 24)
          );
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    const sortedDaysAsc = Array.from(uniqueDays).sort();
    for (let i = 1; i < sortedDaysAsc.length; i++) {
      const current = new Date(sortedDaysAsc[i]);
      const prev = new Date(sortedDaysAsc[i - 1]);
      const diff = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    if (sortedDaysAsc.length === 0) longestStreak = 0;

    // Weekly activity (last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weeklyActivity = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekAgo);
      day.setDate(day.getDate() + i);
      const dayStr = day.toISOString().split('T')[0];
      const dayEntries = entries.filter(
        (e) => new Date(e.date).toISOString().split('T')[0] === dayStr
      );
      weeklyActivity.push({
        date: dayStr,
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        entries: dayEntries.length,
        hours: dayEntries.reduce((sum, e) => sum + e.timeSpent, 0),
      });
    }

    // Topic distribution
    const topicCounts = {};
    const topicHours = {};
    entries.forEach((e) => {
      topicCounts[e.topic] = (topicCounts[e.topic] || 0) + 1;
      topicHours[e.topic] = (topicHours[e.topic] || 0) + e.timeSpent;
    });

    const topicDistribution = Object.keys(topicCounts).map((topic) => ({
      topic,
      count: topicCounts[topic],
      hours: Math.round(topicHours[topic] * 10) / 10,
    }));

    // Difficulty distribution
    const difficultyCount = { Easy: 0, Medium: 0, Hard: 0, Expert: 0 };
    entries.forEach((e) => {
      difficultyCount[e.difficulty]++;
    });

    // Calculate XP and Levels
    const totalXP = (totalHours * 100) + (totalEntries * 10);
    const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;

    // Fetch counts from other collections
    const Labs = require('../models/Lab');
    const Memory = require('../models/Memory');
    const labsCompleted = await Labs.countDocuments({ status: 'completed' });
    const memoriesMastered = await Memory.countDocuments({ strength: { $gte: 4 } });

    // Average hours per day
    const avgHoursPerDay =
      totalStudyDays > 0
        ? Math.round((totalHours / totalStudyDays) * 10) / 10
        : 0;

    res.json({
      success: true,
      data: {
        totalEntries,
        totalStudyDays,
        totalHours: Math.round(totalHours * 10) / 10,
        currentStreak,
        longestStreak,
        avgHoursPerDay,
        totalXP,
        level,
        labsCompleted,
        memoriesMastered,
        weeklyActivity,
        topicDistribution,
        difficultyDistribution: difficultyCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/entries/:id - Get single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/entries - Create new entry
router.post('/', async (req, res) => {
  try {
    const entry = new Entry(req.body);
    const saved = await entry.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/entries/:id - Update entry
router.put('/:id', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/entries/:id - Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
