const Inspection = require("../models/Inspection");
const Facility = require("../models/Facility");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { isValidObjectId } = require("../utils/objectId");
const { calculateInspectionStatus } = require("../services/inspection.service");

const createInspection = asyncHandler(async (req, res) => {
  const { facilityId, score, remarks, images, date } = req.body;

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
  });

  facility.lastInspection = inspection.date;
  await facility.save();

  res.status(201).json(inspection);
});

const getInspections = asyncHandler(async (_req, res) => {
  const inspections = await Inspection.find()
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
  res.status(200).json(inspection);
});

const updateInspection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid inspection id");

  const inspection = await Inspection.findById(id);
  if (!inspection) throw new ApiError(404, "Inspection not found");

  if (inspection.inspectorId.toString() !== req.user.id) {
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

  await inspection.save();
  res.status(200).json(inspection);
});

const deleteInspection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid inspection id");

  const inspection = await Inspection.findByIdAndDelete(id);
  if (!inspection) throw new ApiError(404, "Inspection not found");

  res.status(200).json({ message: "Inspection deleted successfully" });
});

module.exports = {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
};
