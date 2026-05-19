const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  week: { type: String, required: true }, // YYYY-WW
}, { _id: false });

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: ['Practice', 'Reading', 'Lab', 'Review', 'Project', 'Other'],
      default: 'Practice',
    },
    targetDaysPerWeek: {
      type: Number,
      min: 1,
      max: 7,
      default: 5,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    icon: {
      type: String,
      default: '⚡',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    completions: [completionSchema],
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

habitSchema.index({ isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);
