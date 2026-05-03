const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer text is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS', 'Terraform',
        'Ansible', 'Git', 'Networking', 'Monitoring', 'Security',
        'General', 'System Design', 'Other',
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        title: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

questionSchema.index({ category: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.model('Question', questionSchema);
