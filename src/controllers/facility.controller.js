const Facility = require("../models/Facility");
const Village = require("../models/Village");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { isValidObjectId } = require("../utils/objectId");

const createFacility = asyncHandler(async (req, res) => {
  const village = await Village.findById(req.body.villageId);
  if (!village) throw new ApiError(404, "Village not found");

  const facility = await Facility.create(req.body);
  res.status(201).json(facility);
});

const getFacilities = asyncHandler(async (req, res) => {
  const filter = {};
  const { villageId } = req.query;

  if (villageId) {
    if (!isValidObjectId(villageId)) {
      throw new ApiError(400, "Invalid villageId filter");
    }
    filter.villageId = villageId;
  }

  const facilities = await Facility.find(filter)
    .populate("villageId", "name district")
    .sort({ createdAt: -1 });

  res.status(200).json(facilities);
});

const getPublicFacilities = asyncHandler(async (_req, res) => {
  // Only return necessary fields to the public, no internal IDs or deep populates beyond name
  const facilities = await Facility.find()
    .select("name type condition villageId")
    .sort({ name: 1 });
  res.status(200).json(facilities);
});

const getFacilityById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid facility id");

  const facility = await Facility.findById(id).populate(
    "villageId",
    "name district gps"
  );
  if (!facility) throw new ApiError(404, "Facility not found");

  res.status(200).json(facility);
});

const updateFacility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid facility id");

  if (req.body.villageId) {
    const village = await Village.findById(req.body.villageId);
    if (!village) throw new ApiError(404, "Village not found");
  }

  const facility = await Facility.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!facility) throw new ApiError(404, "Facility not found");
  res.status(200).json(facility);
});

const deleteFacility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid facility id");

  const facility = await Facility.findByIdAndDelete(id);
  if (!facility) throw new ApiError(404, "Facility not found");

  res.status(200).json({ message: "Facility deleted successfully" });
});

module.exports = {
  createFacility,
  getFacilities,
  getPublicFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
};
