const Village = require("../models/Village");
const Facility = require("../models/Facility");
const Inspection = require("../models/Inspection");
const Issue = require("../models/Issue");
const asyncHandler = require("../utils/asyncHandler");

const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        villageCount,
        facilityCount,
        inspectionCount,
        pendingIssueCount,
        criticalInspectionCount,
        recentInspections
    ] = await Promise.all([
        Village.countDocuments(),
        Facility.countDocuments(),
        Inspection.countDocuments(),
        Issue.countDocuments({ status: "pending" }),
        Inspection.countDocuments({ status: "critical" }),
        Inspection.find()
            .populate("facilityId", "name")
            .populate("inspectorId", "name")
            .sort({ createdAt: -1 })
            .limit(5)
    ]);

    res.status(200).json({
        counts: {
            villages: villageCount,
            facilities: facilityCount,
            inspections: inspectionCount,
            pendingIssues: pendingIssueCount,
            criticalInspections: criticalInspectionCount
        },
        recentInspections
    });
});

module.exports = {
    getDashboardStats,
};
