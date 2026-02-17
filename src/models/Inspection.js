/**
 * Inspection Model
 * Sanitation inspection records by inspectors
 */

const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: [true, 'Village is required'],
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inspector is required'],
    },
    inspectionDate: {
      type: Date,
      required: [true, 'Inspection date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    findings: {
      type: String,
      trim: true,
    },
    recommendations: {
      type: String,
      trim: true,
    },
    nextInspectionDate: {
      type: Date,
    },
    photos: [{
      type: String, // URLs or paths to uploaded photos
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate references by default
inspectionSchema.pre(/^find/, function (next) {
  this.populate('village', 'name district').populate('inspector', 'name email');
  next();
});

module.exports = mongoose.model('Inspection', inspectionSchema);
