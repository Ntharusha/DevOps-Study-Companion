const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema(
  {
    error: {
      type: String,
      required: [true, 'Error message is required'],
      trim: true,
    },
    context: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    solution: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    occurrences: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
    relatedCommands: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

errorLogSchema.index({ category: 1 });
errorLogSchema.index({ resolved: 1 });
errorLogSchema.index({ occurrences: -1 });
errorLogSchema.index({ error: 'text', solution: 'text', context: 'text' });

module.exports = mongoose.model('ErrorLog', errorLogSchema);
