const mongoose = require('mongoose');

const labStepSchema = new mongoose.Schema({
  command: {
    type: String,
    required: true,
    trim: true,
  },
  output: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'success',
  },
});

const labSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lab title is required'],
      trim: true,
      maxlength: 200,
    },
    topic: {
      type: String,
      required: true,
      enum: [
        'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS', 'Terraform',
        'Ansible', 'Git', 'Networking', 'Monitoring', 'Security',
        'Scripting', 'Nginx', 'Jenkins', 'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    steps: [labStepSchema],
    labErrors: [
      {
        error: { type: String, required: true },
        fix: { type: String, default: '' },
        resolved: { type: Boolean, default: false },
      },
    ],
    environment: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'failed', 'paused'],
      default: 'in-progress',
    },
    duration: {
      type: Number, // minutes
      default: 0,
    },
  },
  { timestamps: true }
);

labSchema.index({ topic: 1 });
labSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lab', labSchema);
