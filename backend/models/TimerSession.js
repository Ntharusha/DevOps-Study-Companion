const mongoose = require('mongoose');

const timerSessionSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ['pomodoro', 'stopwatch', 'countdown'],
      default: 'pomodoro',
    },
    topic: {
      type: String,
      trim: true,
      default: 'Other',
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    breakMinutes: {
      type: Number,
      default: 5,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    // plant XP: each completed session grants XP
    xpEarned: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

timerSessionSchema.index({ completedAt: -1 });
timerSessionSchema.index({ topic: 1 });

module.exports = mongoose.model('TimerSession', timerSessionSchema);
