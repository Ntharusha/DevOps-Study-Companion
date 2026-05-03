const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning',
  },
  timeSpent: {
    type: Number, // in hours
    default: 0,
  },
  technologies: [String],
  githubUrl: String,
  liveUrl: String,
  startDate: {
    type: Date,
    default: Date.now,
  },
  completedDate: Date,
  tasks: [{
    title: String,
    completed: { type: Boolean, default: false }
  }],
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
