const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
    {
        facilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Facility",
            required: true,
        },
        inspectorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        scheduledDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "skipped"],
            default: "pending",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
