/**
 * Issue Model
 * Community-reported issues and improvement requests
 */

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: [true, 'Facility is required'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: [true, 'Severity is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    photos: [{
      type: String,
    }],
    resolutionNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate references
issueSchema.pre(/^find/, function (next) {
  this.populate('facility', 'name type village').populate('reportedBy', 'name email').populate('assignedTo', 'name email');
  next();
});

// Indexes
issueSchema.index({ status: 1 });
issueSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Issue', issueSchema);
