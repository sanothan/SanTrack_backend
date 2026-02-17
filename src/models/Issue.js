/**
 * Issue Model
 * Community-reported issues and improvement requests
 */

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: [true, 'Village is required'],
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
    category: {
      type: String,
      enum: ['Water Supply', 'Waste Management', 'Drainage', 'Hygiene', 'Toilet Facilities', 'Other'],
      default: 'Other',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    location: {
      type: String,
      trim: true,
    },
    photos: [{
      type: String,
    }],
    resolvedAt: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
      trim: true,
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
  this.populate('village', 'name district').populate('reportedBy', 'name email');
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
