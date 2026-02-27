/**
 * Facility Model
 * Represents sanitation facilities (toilets, wells, water tanks, hand pumps)
 */

const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['toilet', 'well', 'water_tank', 'hand_pump'],
      required: [true, 'Facility type is required'],
    },
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: [true, 'Village is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
      },
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
      default: 'fair',
    },
    lastInspection: {
      type: Date,
      default: null,
    },
    installedDate: {
      type: Date,
      required: [true, 'Installation date is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    images: [{
      type: String, // URLs to uploaded images
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
facilitySchema.index({ village: 1, type: 1 });
facilitySchema.index({ location: '2dsphere' });

// Populate references by default
facilitySchema.pre(/^find/, function (next) {
  this.populate('village', 'name district state').populate('createdBy', 'name email');
  next();
});

module.exports = mongoose.model('Facility', facilitySchema);
