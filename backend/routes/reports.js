const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const Lab = require('../models/Lab');
const Command = require('../models/Command');
const ErrorLog = require('../models/ErrorLog');

// GET /api/reports/weekly - Generate weekly report
router.get('/weekly', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    // Entries this week
    const entries = await Entry.find({
      date: { $gte: weekAgo, $lte: today },
    }).sort({ date: -1 });

    const totalHours = entries.reduce((sum, e) => sum + e.timeSpent, 0);
    const uniqueDays = new Set(
      entries.map((e) => new Date(e.date).toISOString().split('T')[0])
    );

    // Topic breakdown
    const topicHours = {};
    const topicDifficulty = {};
    entries.forEach((e) => {
      topicHours[e.topic] = (topicHours[e.topic] || 0) + e.timeSpent;
      if (!topicDifficulty[e.topic]) topicDifficulty[e.topic] = [];
      topicDifficulty[e.topic].push(e.difficulty);
    });

    // Difficulty breakdown
    const difficultyCount = { Easy: 0, Medium: 0, Hard: 0, Expert: 0 };
    entries.forEach((e) => {
      difficultyCount[e.difficulty]++;
    });

    // Labs this week
    const labs = await Lab.find({
      createdAt: { $gte: weekAgo, $lte: today },
    });
    const labsCompleted = labs.filter((l) => l.status === 'completed').length;

    // Errors this week
    const errors = await ErrorLog.find({
      createdAt: { $gte: weekAgo, $lte: today },
    });
    const errorsResolved = errors.filter((e) => e.resolved).length;

    // Commands saved this week
    const newCommands = await Command.countDocuments({
      createdAt: { $gte: weekAgo, $lte: today },
    });

    // Daily activity breakdown
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const dayStr = day.toISOString().split('T')[0];
      const dayEntries = entries.filter(
        (e) => new Date(e.date).toISOString().split('T')[0] === dayStr
      );
      dailyBreakdown.push({
        date: dayStr,
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        entries: dayEntries.length,
        hours: Math.round(dayEntries.reduce((s, e) => s + e.timeSpent, 0) * 10) / 10,
        topics: [...new Set(dayEntries.map((e) => e.topic))],
      });
    }

    // Calculate skill XP earned this week
    let weeklyXP = 0;
    entries.forEach((e) => {
      const diffMultiplier =
        e.difficulty === 'Easy' ? 1 : e.difficulty === 'Medium' ? 1.5 : e.difficulty === 'Hard' ? 2.5 : 4;
      weeklyXP += Math.round(e.timeSpent * 10 * diffMultiplier);
    });
    weeklyXP += labsCompleted * 50;
    weeklyXP += errorsResolved * 20;
    weeklyXP += newCommands * 5;

    // Consistency score (0-100)
    const consistencyScore = Math.round((uniqueDays.size / 7) * 100);

    res.json({
      success: true,
      data: {
        period: {
          start: weekAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        },
        summary: {
          totalEntries: entries.length,
          totalHours: Math.round(totalHours * 10) / 10,
          activeDays: uniqueDays.size,
          consistencyScore,
        },
        topics: Object.entries(topicHours).map(([topic, hours]) => ({
          topic,
          hours: Math.round(hours * 10) / 10,
          sessions: entries.filter((e) => e.topic === topic).length,
        })),
        difficulty: difficultyCount,
        labs: {
          total: labs.length,
          completed: labsCompleted,
        },
        errors: {
          total: errors.length,
          resolved: errorsResolved,
        },
        newCommands,
        dailyBreakdown,
        weeklyXP,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/skill - Get skill score and level
router.get('/skill', async (req, res) => {
  try {
    const entries = await Entry.find();
    const labs = await Lab.find();
    const errors = await ErrorLog.find();
    const commands = await Command.find();

    // Calculate total XP
    let totalXP = 0;

    // XP from entries (time * difficulty multiplier * 10)
    entries.forEach((e) => {
      const mult =
        e.difficulty === 'Easy' ? 1 : e.difficulty === 'Medium' ? 1.5 : e.difficulty === 'Hard' ? 2.5 : 4;
      totalXP += Math.round(e.timeSpent * 10 * mult);
    });

    // XP from labs
    totalXP += labs.filter((l) => l.status === 'completed').length * 50;
    totalXP += labs.reduce((sum, l) => sum + l.steps.length, 0) * 5;

    // XP from resolved errors
    totalXP += errors.filter((e) => e.resolved).length * 20;

    // XP from commands
    totalXP += commands.length * 5;

    // Streak bonus
    const uniqueDays = [
      ...new Set(entries.map((e) => new Date(e.date).toISOString().split('T')[0])),
    ].sort();
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sortedDesc = [...uniqueDays].sort().reverse();
    if (sortedDesc.length > 0) {
      const latest = new Date(sortedDesc[0]);
      latest.setHours(0, 0, 0, 0);
      if (Math.floor((today - latest) / 86400000) <= 1) {
        currentStreak = 1;
        for (let i = 1; i < sortedDesc.length; i++) {
          const diff = Math.floor(
            (new Date(sortedDesc[i - 1]) - new Date(sortedDesc[i])) / 86400000
          );
          if (diff === 1) currentStreak++;
          else break;
        }
      }
    }
    totalXP += currentStreak * 10; // Streak bonus

    // Level system
    const levels = [
      { level: 1, title: 'Beginner', minXP: 0 },
      { level: 2, title: 'Learner', minXP: 100 },
      { level: 3, title: 'Practitioner', minXP: 300 },
      { level: 4, title: 'Explorer', minXP: 600 },
      { level: 5, title: 'Builder', minXP: 1000 },
      { level: 6, title: 'Engineer', minXP: 1500 },
      { level: 7, title: 'Specialist', minXP: 2200 },
      { level: 8, title: 'Expert', minXP: 3000 },
      { level: 9, title: 'Master', minXP: 4000 },
      { level: 10, title: 'DevOps Guru', minXP: 5500 },
    ];

    let currentLevel = levels[0];
    let nextLevel = levels[1];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalXP >= levels[i].minXP) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || null;
        break;
      }
    }

    const progress = nextLevel
      ? Math.round(
          ((totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        )
      : 100;

    // Topic skill breakdown
    const topicXP = {};
    entries.forEach((e) => {
      const mult =
        e.difficulty === 'Easy' ? 1 : e.difficulty === 'Medium' ? 1.5 : e.difficulty === 'Hard' ? 2.5 : 4;
      topicXP[e.topic] = (topicXP[e.topic] || 0) + Math.round(e.timeSpent * 10 * mult);
    });

    res.json({
      success: true,
      data: {
        totalXP,
        level: currentLevel.level,
        title: currentLevel.title,
        nextLevel: nextLevel ? { level: nextLevel.level, title: nextLevel.title, xpNeeded: nextLevel.minXP } : null,
        progress,
        currentStreak,
        topicSkills: Object.entries(topicXP)
          .map(([topic, xp]) => ({ topic, xp }))
          .sort((a, b) => b.xp - a.xp),
        breakdown: {
          entriesXP: entries.reduce((sum, e) => {
            const mult =
              e.difficulty === 'Easy' ? 1 : e.difficulty === 'Medium' ? 1.5 : e.difficulty === 'Hard' ? 2.5 : 4;
            return sum + Math.round(e.timeSpent * 10 * mult);
          }, 0),
          labsXP:
            labs.filter((l) => l.status === 'completed').length * 50 +
            labs.reduce((s, l) => s + l.steps.length, 0) * 5,
          errorsXP: errors.filter((e) => e.resolved).length * 20,
          commandsXP: commands.length * 5,
          streakBonus: currentStreak * 10,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
