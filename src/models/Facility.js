const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["toilet", "well", "water_tank"],
      required: true,
    },
    villageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
    },
    condition: {
      type: String,
      enum: ["good", "moderate", "critical"],
      default: "moderate",
    },
    lastInspection: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Facility", facilitySchema);
