const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    gps: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    population: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Village", villageSchema);
