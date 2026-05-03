const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  concept: {
    type: String,
    required: [true, 'Concept is required'],
    trim: true,
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required'],
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  tags: [String],
  strength: {
    type: Number,
    default: 1, // 1-5, how well it's memorized
    min: 1,
    max: 5
  },
  lastReviewed: {
    type: Date,
    default: Date.now,
  },
  nextReview: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Memory', memorySchema);
