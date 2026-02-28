const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    inspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inspection",
      required: false,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    reporterName: {
      type: String,
      default: "Anonymous Citizen",
    },
    reporterContact: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.Mixed,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
