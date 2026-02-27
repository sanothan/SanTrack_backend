/**
 * Village Model
 * Represents a village/community in the sanitation system
 */

const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Village name is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    population: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalHouseholds: {
      type: Number,
      min: 0,
      default: 0,
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
villageSchema.index({ name: 1, district: 1 }, { unique: true });

module.exports = mongoose.model('Village', villageSchema);
