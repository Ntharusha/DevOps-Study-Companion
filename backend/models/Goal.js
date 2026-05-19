const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    targetHours: {
      type: Number,
      required: true,
      min: 0.5,
      max: 100,
    },
    weekLabel: {
      type: String, // e.g. "2025-W20"
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

goalSchema.index({ weekLabel: 1 });

module.exports = mongoose.model('Goal', goalSchema);
