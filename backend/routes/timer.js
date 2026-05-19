const express = require('express');
const router = express.Router();
const TimerSession = require('../models/TimerSession');

// GET all timer sessions (paginated)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const sessions = await TimerSession.find()
      .sort({ completedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await TimerSession.countDocuments();
    res.json({ success: true, data: sessions, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET timer stats (plant XP, total minutes, sessions count)
router.get('/stats', async (req, res) => {
  try {
    const sessions = await TimerSession.find({ completed: true });
    const totalXP = sessions.reduce((a, s) => a + (s.xpEarned || 0), 0);
    const totalMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);
    const totalSessions = sessions.length;

    // Sessions this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSessions = sessions.filter((s) => new Date(s.completedAt) >= weekAgo);
    const weekMinutes = weekSessions.reduce((a, s) => a + s.durationMinutes, 0);

    // Topic breakdown
    const topicMap = {};
    sessions.forEach((s) => {
      if (s.topic) {
        topicMap[s.topic] = (topicMap[s.topic] || 0) + s.durationMinutes;
      }
    });

    // Plant level based on XP
    const plantLevel = getPlantLevel(totalXP);

    res.json({
      success: true,
      data: {
        totalXP,
        totalMinutes,
        totalSessions,
        weekMinutes,
        weekSessions: weekSessions.length,
        topicBreakdown: topicMap,
        plantLevel,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST save timer session
router.post('/', async (req, res) => {
  try {
    const xpEarned = calculateXP(req.body.durationMinutes, req.body.mode);
    const session = new TimerSession({ ...req.body, xpEarned });
    await session.save();
    res.status(201).json({ success: true, data: session, xpEarned });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE session
router.delete('/:id', async (req, res) => {
  try {
    await TimerSession.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function calculateXP(minutes, mode) {
  const base = Math.floor(minutes / 5) * 5; // 5 XP per 5 min
  const multiplier = mode === 'pomodoro' ? 1.5 : 1;
  return Math.max(5, Math.round(base * multiplier));
}

function getPlantLevel(xp) {
  if (xp < 50) return { level: 1, name: 'Seed 🌱', emoji: '🌱', next: 50 };
  if (xp < 150) return { level: 2, name: 'Sprout 🌿', emoji: '🌿', next: 150 };
  if (xp < 300) return { level: 3, name: 'Sapling 🌾', emoji: '🌾', next: 300 };
  if (xp < 500) return { level: 4, name: 'Bush 🌳', emoji: '🌳', next: 500 };
  if (xp < 800) return { level: 5, name: 'Young Tree 🌲', emoji: '🌲', next: 800 };
  if (xp < 1200) return { level: 6, name: 'Tree 🌴', emoji: '🌴', next: 1200 };
  return { level: 7, name: 'Ancient Tree 🎋', emoji: '🎋', next: null };
}

module.exports = router;
