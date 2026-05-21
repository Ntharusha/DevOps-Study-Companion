const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    timeSpent: {
      type: Number,
      required: [true, 'Time spent is required'],
      min: [0.25, 'Minimum time is 15 minutes (0.25 hours)'],
      max: [24, 'Maximum time is 24 hours'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient date-based queries
entrySchema.index({ date: -1 });
entrySchema.index({ topic: 1 });

module.exports = mongoose.model('Entry', entrySchema);
