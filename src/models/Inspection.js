/**
 * Inspection Model
 * Sanitation inspection records by inspectors
 */

const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: [true, 'Facility is required'],
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inspector is required'],
    },
    date: {
      type: Date,
      required: [true, 'Inspection date is required'],
      default: Date.now,
    },
    score: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, 'Score is required'],
    },
    status: {
      type: String,
      enum: ['good', 'needs_attention', 'critical'],
      required: [true, 'Status is required'],
    },
    photos: [{
      type: String, // URLs to uploaded photos
    }],
    notes: {
      type: String,
      trim: true,
    },
    recommendations: {
      type: String,
      trim: true,
    },
    nextInspectionDue: {
      type: Date,
      required: [true, 'Next inspection date is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate references by default
inspectionSchema.pre(/^find/, function (next) {
  this.populate('facility', 'name type condition').populate('inspector', 'name email');
  next();
});

// Calculate score based on various factors
inspectionSchema.methods.calculateScore = function() {
  // This is a placeholder for score calculation logic
  // In a real implementation, this would consider various factors
  return this.score;
};

// Determine status based on score
inspectionSchema.methods.determineStatus = function() {
  if (this.score >= 8) return 'good';
  if (this.score >= 5) return 'needs_attention';
  return 'critical';
};

// Indexes
inspectionSchema.index({ facility: 1, date: 1 });
inspectionSchema.index({ inspector: 1 });

module.exports = mongoose.model('Inspection', inspectionSchema);
