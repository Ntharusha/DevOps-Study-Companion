const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    command: {
      type: String,
      required: [true, 'Command is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Docker', 'Kubernetes', 'Linux', 'Git', 'AWS', 'Terraform',
        'Ansible', 'Networking', 'Nginx', 'CI/CD', 'Monitoring',
        'Security', 'Scripting', 'Other',
      ],
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    useCount: {
      type: Number,
      default: 0,
    },
    lastUsed: {
      type: Date,
    },
  },
  { timestamps: true }
);

commandSchema.index({ category: 1 });
commandSchema.index({ isFavorite: -1 });
commandSchema.index({ useCount: -1 });

module.exports = mongoose.model('Command', commandSchema);
