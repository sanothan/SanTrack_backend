/**
 * Report Model
 * Generated analytics and reports for the sanitation system
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly', 'custom'],
      required: [true, 'Report type is required'],
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Generator is required'],
    },
    dateRange: {
      startDate: {
        type: Date,
        required: [true, 'Start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'End date is required'],
      },
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Flexible data structure for different report types
      required: [true, 'Report data is required'],
    },
    format: {
      type: String,
      enum: ['pdf', 'csv', 'json'],
      default: 'json',
    },
    filePath: {
      type: String, // Path to generated file (if applicable)
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ type: 1 });

// Populate references by default
reportSchema.pre(/^find/, function (next) {
  this.populate('generatedBy', 'name email');
  next();
});

module.exports = mongoose.model('Report', reportSchema);
