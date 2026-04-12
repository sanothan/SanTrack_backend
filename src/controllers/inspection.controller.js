const Inspection = require("../models/Inspection");
const Facility = require("../models/Facility");
const Issue = require("../models/Issue");
const Schedule = require("../models/Schedule");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { isValidObjectId } = require("../utils/objectId");
const {
  calculateInspectionStatus,
  ensureCriticalFollowUp,
} = require("../services/inspection.service");

const createInspection = asyncHandler(async (req, res) => {
  const {
    facilityId,
    score,
    remarks,
    images,
    date,
    cleanlinessLevel,
    odorLevel,
    waterAvailability,
    suppliesStatus,
    maintenanceRequired,
  } = req.body;

  const facility = await Facility.findById(facilityId);
  if (!facility) throw new ApiError(404, "Facility not found");

  const status = calculateInspectionStatus(score);
  const inspection = await Inspection.create({
    facilityId,
    inspectorId: req.user.id,
    score,
    remarks,
    images: images || [],
    status,
    date: date || new Date(),
    cleanlinessLevel,
    odorLevel,
    waterAvailability,
    suppliesStatus,
    maintenanceRequired,
  });

  await ensureCriticalFollowUp(inspection);

  facility.lastInspection = inspection.date;
  await facility.save();

  const populatedInspection = await Inspection.findById(inspection._id)
    .populate("facilityId", "name type condition")
    .populate("inspectorId", "name email role");

  res.status(201).json(populatedInspection);
});

const getInspections = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const isInspector = req.user.role === "inspector";

  if (!isAdmin && !isInspector) {
    throw new ApiError(403, "You are not authorized to view inspections");
  }

  const filters = isInspector ? { inspectorId: req.user.id } : {};

  const inspections = await Inspection.find(filters)
    .populate("facilityId", "name type condition")
    .populate("inspectorId", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json(inspections);
});

const getInspectionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid inspection id");

  const inspection = await Inspection.findById(id)
    .populate("facilityId", "name type condition")
    .populate("inspectorId", "name email role");

  if (!inspection) throw new ApiError(404, "Inspection not found");

  const isAdmin = req.user.role === "admin";
  const isInspectorOwner =
    req.user.role === "inspector" && inspection.inspectorId?._id?.toString() === req.user.id;

  if (!isAdmin && !isInspectorOwner) {
    throw new ApiError(403, "You are not authorized to view this inspection");
  }

  res.status(200).json(inspection);
});

const getInspectionSyncHistory = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const isInspector = req.user.role === "inspector";

  if (!isAdmin && !isInspector) {
    throw new ApiError(403, "You are not authorized to view sync history");
  }

  const requestedLimit = Number(req.query.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 20)
    : 5;

  const filters = isInspector ? { inspectorId: req.user.id } : {};

  const inspections = await Inspection.find(filters)
    .populate("facilityId", "name type")
    .populate("inspectorId", "name")
    .sort({ createdAt: -1 })
    .limit(limit);

  const items = await Promise.all(
    inspections.map(async (inspection) => {
      const facilityId = inspection.facilityId?._id || inspection.facilityId;
      const inspectorId = inspection.inspectorId?._id || inspection.inspectorId;

      const [issue, schedule] = await Promise.all([
        Issue.findOne({
          facilityId,
          inspectionId: inspection._id,
          status: { $in: ["pending", "in_progress"] },
        })
          .select("_id status")
          .sort({ createdAt: -1 }),
        Schedule.findOne({
          facilityId,
          inspectorId,
          status: "pending",
        })
          .select("_id scheduledDate priority status")
          .sort({ scheduledDate: 1 }),
      ]);

      const scheduleData = schedule ? schedule.toObject() : null;
      if (scheduleData) {
        scheduleData.isOverdue = new Date(scheduleData.scheduledDate) < new Date();
      }

      return {
        inspection,
        followUp: {
          issue,
          schedule: scheduleData,
        },
      };
    })
  );

  res.status(200).json({ items });
});

const updateInspection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid inspection id");

  const inspection = await Inspection.findById(id);
  if (!inspection) throw new ApiError(404, "Inspection not found");

  const previousStatus = inspection.status;

  const isAdmin = req.user.role === "admin";
  if (!isAdmin && inspection.inspectorId.toString() !== req.user.id) {
    throw new ApiError(403, "You can only update your own inspections");
  }

  if (req.body.facilityId) {
    const facility = await Facility.findById(req.body.facilityId);
    if (!facility) throw new ApiError(404, "Facility not found");
    inspection.facilityId = req.body.facilityId;
  }

  if (req.body.score !== undefined) {
    inspection.score = req.body.score;
    inspection.status = calculateInspectionStatus(req.body.score);
  }

  if (req.body.remarks !== undefined) inspection.remarks = req.body.remarks;
  if (req.body.images !== undefined) inspection.images = req.body.images;
  if (req.body.date !== undefined) inspection.date = req.body.date;
  if (req.body.cleanlinessLevel !== undefined)
    inspection.cleanlinessLevel = req.body.cleanlinessLevel;
  if (req.body.odorLevel !== undefined)
    inspection.odorLevel = req.body.odorLevel;
  if (req.body.waterAvailability !== undefined)
    inspection.waterAvailability = req.body.waterAvailability;
  if (req.body.suppliesStatus !== undefined)
    inspection.suppliesStatus = req.body.suppliesStatus;
  if (req.body.maintenanceRequired !== undefined)
    inspection.maintenanceRequired = req.body.maintenanceRequired;

  await inspection.save();

  if (inspection.status === "critical" && previousStatus !== "critical") {
    await ensureCriticalFollowUp(inspection);
  }

  const populatedInspection = await Inspection.findById(id)
    .populate("facilityId", "name type condition")
    .populate("inspectorId", "name email role");

  res.status(200).json(populatedInspection);
});

const deleteInspection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid inspection id");

  const inspection = await Inspection.findById(id);
  if (!inspection) throw new ApiError(404, "Inspection not found");

  const isAdmin = req.user.role === "admin";
  if (!isAdmin && inspection.inspectorId.toString() !== req.user.id) {
    throw new ApiError(403, "You can only delete your own inspections");
  }

  await Inspection.findByIdAndDelete(id);

  res.status(200).json({ message: "Inspection deleted successfully" });
});

module.exports = {
  createInspection,
  getInspections,
  getInspectionSyncHistory,
  getInspectionById,
  updateInspection,
  deleteInspection,
};
